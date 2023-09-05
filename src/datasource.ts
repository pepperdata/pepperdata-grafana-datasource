import { DataQueryRequest, DataSourceApi, DataSourceInstanceSettings, toDataFrame } from '@grafana/data';
import { map, merge, catchError, of, lastValueFrom } from 'rxjs';

import { MyQuery, MyDataSourceOptions } from './types';
import _ from 'lodash';
import { getBackendSrv } from '@grafana/runtime';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url;
  }

  fetchMetric(realm: string, metricParams: Record<string, any>) {
    if (realm) {
      const result = getBackendSrv().fetch({
        method: 'GET',
        url: `${this.url}/api/${realm}/api/m`,
        params: {
          // Remove points without enough hosts reporting
          removeincomplete: 1,
          omitpoints: 'null',
          ...metricParams,
        },
      });

      return result;
    }
    return of();
  }

  query(options: DataQueryRequest<MyQuery>) {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();
    const rangeMs = options.range.to.valueOf() - options.range.from.valueOf();
    const sample = Math.max(10000, options.maxDataPoints ? Math.round(rangeMs / options.maxDataPoints) : 0);

    const dataFrames = options.targets
      .filter((target) => !target.hide)
      .map((target) => {
        const { downsampler, tags, metric, alias, queryText } = target;
        const paramsFromQueryText = Object.fromEntries(new URLSearchParams(queryText));
        return this.fetchMetric(target.realm ?? '', {
          sample,
          s: from,
          e: to,
          ...(queryText
            ? paramsFromQueryText
            : {
                m: metric,
                ...(downsampler && { downsampler }),
                ...tags,
              }),
        }).pipe(
          map((response: any) => {
            const numSeries = response.data.data.allSeries.length;
            const frames = response.data.data.allSeries.map(
              ({ dataPoints, seriesId }: { dataPoints: number[][]; seriesId: string }) => {
                const frame = toDataFrame(
                  dataPoints
                    .filter((dp) => dp)
                    .map(([timestamp, value]) => ({
                      Time: timestamp * 1000,
                      Value: value,
                    }))
                );
                frame.name = alias ? `${alias} ${numSeries > 1 ? seriesId : ''}` : seriesId;
                frame.refId = target.refId;
                return frame;
              }
            );

            return { data: frames };
          }),
          catchError((error) => {
            console.log(error);

            return of();
          })
        );
      });

    return merge(...dataFrames);
  }

  async testDatasource() {
    const faviconObservable = getBackendSrv().fetch({
      method: 'GET',
      url: `${this.url}/api/favicon.ico`,
    });
    const response = await lastValueFrom(faviconObservable);

    if (response.status === 200) {
      return {
        status: 'success',
        message: 'Data source is connected.',
      };
    }

    return {
      status: 'error',
      message: 'Could not connect to data source.',
    };
  }
}
