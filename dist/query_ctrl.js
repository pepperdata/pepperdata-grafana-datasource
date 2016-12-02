'use strict';

System.register(['app/plugins/sdk', './css/query-editor.css!', './utils', 'lodash'], function (_export, _context) {
  "use strict";

  var QueryCtrl, Utils, _, _createClass, tagKeyLookup, tagUrlKeyLookup, GenericDatasourceQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_cssQueryEditorCss) {}, function (_utils) {
      Utils = _utils;
    }, function (_lodash) {
      _ = _lodash.default;
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

      tagKeyLookup = {
        "host": "h",
        "user": "u",
        "job group": "c",
        "queue": "q",
        "app type": "apptype",
        "workflow": "w",
        "job": "j",
        "task type": "tt",
        "server type": "svt",
        "spark type": "sst",
        "task": "t",
        "device": "d",
        "sub-device": "sd",
        "inserting host": "inshost",
        "compression": "inscomp",
        "file type": "instype",
        "scheduler start": "ss",
        "version": "v",
        "region": "region",
        "table": "table",
        "namespace": "namespace"
      };
      tagUrlKeyLookup = _.invert(tagKeyLookup);

      _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl = function (_QueryCtrl) {
        _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

        function GenericDatasourceQueryCtrl($scope, $injector, uiSegmentSrv) {
          _classCallCheck(this, GenericDatasourceQueryCtrl);

          var _this = _possibleConstructorReturn(this, (GenericDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(GenericDatasourceQueryCtrl)).call(this, $scope, $injector));

          _this.scope = $scope;
          _this.uiSegmentSrv = uiSegmentSrv;
          _this.target.metricUrlName = _this.target.metricUrlName || '';
          _this.target.rawDashboardQuery = _this.target.rawDashboardQuery || "";
          return _this;
        }

        // remove?


        _createClass(GenericDatasourceQueryCtrl, [{
          key: 'getOptions',
          value: function getOptions() {
            return this.datasource.metricFindQuery(this.target).then(this.uiSegmentSrv.transformToSegments(false));
            // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
          }
        }, {
          key: 'addTag',
          value: function addTag() {

            if (this.target.filters && this.target.filters.length > 0) {
              this.errors.tags = "Please remove filters to use tags, tags and filters are mutually exclusive.";
            }

            if (!this.addTagMode) {
              this.addTagMode = true;
              return;
            }

            if (!this.target.tags) {
              this.target.tags = {};
            }

            // this.errors = this.validateTarget();

            //if (!this.errors.tags) {
            this.target.tags[this.target.currentTagKey] = this.target.currentTagValue;
            this.target.currentTagKey = '';
            this.target.currentTagValue = '';
            this.targetBlur();
            //}

            this.addTagMode = false;
          }
        }, {
          key: 'removeTag',
          value: function removeTag(key) {
            delete this.target.tags[key];
            this.targetBlur();
          }
        }, {
          key: 'editTag',
          value: function editTag(key, value) {
            this.removeTag(key);
            this.target.currentTagKey = key;
            this.target.currentTagValue = value;
            this.addTag();
          }
        }, {
          key: 'closeAddTagMode',
          value: function closeAddTagMode() {
            this.addTagMode = false;
            return;
          }
        }, {
          key: 'suggestTagKeys',
          value: function suggestTagKeys(query, callback) {
            //this.datasource.suggestTagKeys(this.target.metric).then(callback);
            callback(_.map(tagKeyLookup, function (v, k) {
              return k;
            }));
          }
        }, {
          key: 'targetBlur',
          value: function targetBlur() {
            //this.errors = this.validateTarget();
            //this.refresh();
            this.onChangeInternal();
          }
        }, {
          key: 'buildPartialUrl',
          value: function buildPartialUrl() {
            var dashboardQuery = _.assign({
              m: this.target.metricUrlName
            }, this.buildTagQueryObject());
            return Utils.param(dashboardQuery);
          }
        }, {
          key: 'buildTagQueryObject',
          value: function buildTagQueryObject() {
            if (this.target.tags) {
              return _.reduce(this.target.tags, function (result, v, k) {
                var tagName = tagKeyLookup[k];
                if (tagName) {
                  result[tagName] = v;
                }
                return result;
              }, {});
            }
            return {};
          }
        }, {
          key: 'setTargetOptions',
          value: function setTargetOptions() {
            var _this2 = this;

            var parsed = Utils.parseQueryString(this.target.rawDashboardQuery);
            this.target.tags = {};
            _.each(parsed, function (v, k) {
              var tagName = tagUrlKeyLookup[k];
              if (tagName) {
                _this2.target.tags[tagName] = v;
              }
            });
            this.target.metricUrlName = parsed.m || "";
          }
        }, {
          key: 'setRawDashboardQuery',
          value: function setRawDashboardQuery() {
            this.target.rawDashboardQuery = this.buildPartialUrl();
          }
        }, {
          key: 'toggleEditorMode',
          value: function toggleEditorMode() {
            if (this.target.rawQuery) {
              // parse the raw query and set the target options
              this.setTargetOptions();
            } else {
              this.setRawDashboardQuery();
            }

            this.target.rawQuery = !this.target.rawQuery;
          }
        }, {
          key: 'onChangeInternal',
          value: function onChangeInternal() {
            this.setRawDashboardQuery();
            this.panelCtrl.refresh(); // Asks the panel to refresh data.
          }
        }, {
          key: 'onRawChangeInternal',
          value: function onRawChangeInternal() {
            this.setTargetOptions();
            this.panelCtrl.refresh();
          }
        }]);

        return GenericDatasourceQueryCtrl;
      }(QueryCtrl));

      _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl);

      GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map
