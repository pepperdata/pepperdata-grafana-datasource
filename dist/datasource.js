'use strict';

System.register(['lodash', './utils', 'moment'], function (_export, _context) {
  "use strict";

  var _, Utils, moment, _createClass, PEPPERDATA_DATE_FORMAT, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_utils) {
      Utils = _utils;
    }, function (_moment) {
      moment = _moment.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      PEPPERDATA_DATE_FORMAT = 'YYYY/MM/DD-HH:mm';

      _export('GenericDatasource', GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          this.type = instanceSettings.type;
          this.url = instanceSettings.url;
          this.name = instanceSettings.name;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        _createClass(GenericDatasource, [{
          key: 'query',
          value: function query(options) {
            var _this = this;

            var templateReplace = function templateReplace(query) {
              return _this.templateSrv.replace(query, null, 'regex');
            };
            var rangeMs = options.range.to.valueOf() - options.range.from.valueOf();
            var sample = Math.max(10000, Math.round(rangeMs / options.maxDataPoints));
            var dashboardQuery = _.assign({
              s: templateReplace(options.range.from.format(PEPPERDATA_DATE_FORMAT)),
              e: templateReplace(options.range.to.format(PEPPERDATA_DATE_FORMAT)),
              tzo: options.range.from.utcOffset() / 60,
              sample: sample
            });
            var promises = _(options.targets).filter(function (t) {
              return !t.hide;
            }).map(function (target) {
              var qs = Utils.parseQueryString(target.rawDashboardQuery);
              _.each(qs, function (value, key) {
                qs[key] = templateReplace(value);
              });

              var url = _this.buildUrl(target.cluster, '/api/m?', Utils.param(dashboardQuery) + "&" + Utils.param(qs));
              return _this.backendSrv.datasourceRequest({
                url: url,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              });
            }).value();

            if (promises.length <= 0) {
              return this.q.when({ data: [] });
            }

            return this.q.all(promises).then(function (responses) {
              return {
                data: _(responses).map(function (response, i) {
                  return _this.transformPDResult(response, options.targets[i].alias);
                }).flatten().value()
              };
            });
          }
        }, {
          key: 'buildUrl',
          value: function buildUrl(clusterName, dashboardQuery, queryString) {
            return this.url.replace(/\/$/, "") + "/" + clusterName + '/' + dashboardQuery.replace(/(^\/|\?$)/g, '') + '?' + queryString;
          }
        }, {
          key: 'transformPDResult',
          value: function transformPDResult(response, alias) {
            var transformedSeries = _.map(response.data.data.allSeries, function (series) {
              return {
                target: series.seriesId,
                datapoints: _.map(series.dataPoints, function (point) {
                  return point ? [point[1], point[0] * 1000] : [null, null];
                })
              };
            });

            if (alias) {
              (function () {
                var isSingleSeries = transformedSeries.length === 1;
                _.forEach(transformedSeries, function (series) {
                  series.target = alias + (isSingleSeries ? "" : " " + series.target);
                });
              })();
            }
            return transformedSeries;
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.backendSrv.datasourceRequest({
              url: this.url + '/favicon.ico',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
              }
            });
          }
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
