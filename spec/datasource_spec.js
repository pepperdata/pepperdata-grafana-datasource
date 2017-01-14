import {Datasource} from "../module";
import Q from "q";
import _ from "lodash";

describe('GenericDatasource', function () {
  var ctx = {};
  const queryData = {
    range: {
      from: {format: () => 'from', utcOffset: ()=> -8},
      to: {format: () => 'to'}
    },
    maxDataPoints: 1024,
    targets: [{rawDashboardQuery:'m=tasks', cluster:"mycluster"}]
  };
  beforeEach(function () {
    ctx.instanceSettings = {};
    ctx.instanceSettings.url = "http://localhost:3000/";
    ctx.$q = Q;
    ctx.backendSrv = {};
    ctx.templateSrv = {};
    ctx.templateSrv.replace = function (data) {
      return data;
    };
    ctx.ds = new Datasource(ctx.instanceSettings, ctx.$q, ctx.backendSrv, ctx.templateSrv);
  });

  it('should return an empty array when no targets are set', function (done) {
    ctx.ds.query(_.extend({}, queryData, {targets: []})).then(function (result) {
      expect(result.data).to.have.length(0);
      done();
    });
  });

  it('should return the server results when a target is set', function () {
    // done();
    // return;
    ctx.backendSrv.datasourceRequest = function (request) {
      return ctx.$q.when({
        _request: request,
        data: {
          data: {
            allSeries: [
              {
                seriesId: 'tasks',
                dataPoints: [[1479429840, 31], [1479429900, 8]]
              }
            ]
          }
        }
      });
    };

    const promise = ctx.ds.query(queryData);
    return promise.then(function (result) {
      expect(result.data).to.have.length(1);
      var series = result.data[0];
      expect(series.target).to.equal('tasks');
      expect(series.datapoints).to.have.length(2);
    });
  });
});
