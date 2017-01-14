import _ from "lodash";
import * as Utils from './utils';
import moment from 'moment';

const PEPPERDATA_DATE_FORMAT = 'YYYY/MM/DD-HH:mm';
export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
  }

  query(options) {
    const templateReplace = query => this.templateSrv.replace(query, null, 'regex');
    const rangeMs = moment(options.range.from).subtract(options.range.to).valueOf();
    const sample = Math.round(rangeMs / options.maxDataPoints / 1000);
    const dashboardQuery = _.assign({
      s: templateReplace(options.range.from.format(PEPPERDATA_DATE_FORMAT)),
      e: templateReplace(options.range.to.format(PEPPERDATA_DATE_FORMAT)),
      tzo: options.range.from.utcOffset() /  60,
      sample: sample
    });
    const promises = _(options.targets).filter(t => !t.hide).map((target) => {
      var qs = Utils.parseQueryString(target.rawDashboardQuery);
      _.each(qs, function(value, key) {
        qs[key] = templateReplace(value)
      });

      const url = this.url.replace(/\/$/, "") + "/" + target.cluster +'/api/m?'
          + Utils.param(dashboardQuery)
          + "&" + Utils.param(qs);
      return this.backendSrv.datasourceRequest({
        url,
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      });
    }).value();

    if (promises.length <= 0) {
      return this.q.when({data: []});
    }

    return this.q.all(promises).then((responses) => {
      return {
        data: _(responses).map((response)=> {
          return this.transformPDResult(response);
        }).flatten().value()
      };
    });

  }

  transformPDResult(response) {
    return _.map(response.data.data.allSeries, (series) => {
      return {
        target: series.seriesId,
        datapoints: _.map(series.dataPoints, function (point) {
          return point ? [point[1], point[0] * 1000] : [null, null]
        })
      };
    });
  }

  testDatasource() {
    return this.backendSrv.datasourceRequest({
      url: this.url + '/favicon.ico',
      method: 'GET'
    }).then(response => {
      if (response.status === 200) {
        return {status: "success", message: "Data source is working", title: "Success"};
      }
    });
  }

  // annotationQuery(options) {
  //   var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
  //   var annotationQuery = {
  //     range: options.range,
  //     annotation: {
  //       name: options.annotation.name,
  //       datasource: options.annotation.datasource,
  //       enable: options.annotation.enable,
  //       iconColor: options.annotation.iconColor,
  //       query: query
  //     },
  //     rangeRaw: options.rangeRaw
  //   };
  //
  //   return this.backendSrv.datasourceRequest({
  //     url: this.url + '/annotations',
  //     method: 'POST',
  //     data: annotationQuery
  //   }).then(result => {
  //     return result.data;
  //   });
  // }

  // metricFindQuery(options) {
  //   var interpolated = {
  //     target: this.templateSrv.replace(options.target, null, 'regex')
  //   };
  //
  //   return this.backendSrv.datasourceRequest({
  //     url: this.url + '/search',
  //     data: interpolated,
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' }
  //   }).then(this.mapToTextValue);
  // }

  // mapToTextValue(result) {
  //   return _.map(result.data, (d, i) => {
  //     return { text: d, value: i};
  //   });
  // }
}
