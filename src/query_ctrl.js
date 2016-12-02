import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'
import * as Utils from './utils';
import _ from 'lodash';

const tagKeyLookup = {
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
  "namespace": "namespace",
};

const tagUrlKeyLookup = _.invert(tagKeyLookup);

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv) {
    super($scope, $injector);
    this.scope = $scope;
    this.uiSegmentSrv = uiSegmentSrv;
    this.target.metricUrlName = this.target.metricUrlName || '';
    this.target.rawDashboardQuery = this.target.rawDashboardQuery || "";
  }

  // remove?
  getOptions() {
    return this.datasource.metricFindQuery(this.target)
        .then(this.uiSegmentSrv.transformToSegments(false));
    // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
  }

  addTag() {

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

  removeTag(key) {
    delete this.target.tags[key];
    this.targetBlur();
  }

  editTag(key, value) {
    this.removeTag(key);
    this.target.currentTagKey = key;
    this.target.currentTagValue = value;
    this.addTag();
  }

  closeAddTagMode() {
    this.addTagMode = false;
    return;
  }

  suggestTagKeys(query, callback) {
    //this.datasource.suggestTagKeys(this.target.metric).then(callback);
    callback(_.map(tagKeyLookup, (v, k) => {
      return k
    }));
  };

  targetBlur() {
    //this.errors = this.validateTarget();
    //this.refresh();
    this.onChangeInternal();
  }

  buildPartialUrl() {
    const dashboardQuery = _.assign({
      m: this.target.metricUrlName
    }, this.buildTagQueryObject());
    return Utils.param(dashboardQuery);
  }

  buildTagQueryObject() {
    if (this.target.tags) {
      return _.reduce(this.target.tags, (result, v, k)=> {
        const tagName = tagKeyLookup[k];
        if (tagName) {
          result[tagName] = v;
        }
        return result
      }, {});
    }
    return {};
  }

  setTargetOptions() {
    const parsed = Utils.parseQueryString(this.target.rawDashboardQuery);
    this.target.tags = {};
    _.each(parsed, (v, k) => {
      const tagName = tagUrlKeyLookup[k];
      if (tagName) {
        this.target.tags[tagName] = v;
      }
    });
    this.target.metricUrlName = parsed.m || "";
  }

  setRawDashboardQuery() {
    this.target.rawDashboardQuery = this.buildPartialUrl();
  }

  toggleEditorMode() {
    if (this.target.rawQuery) {
      // parse the raw query and set the target options
      this.setTargetOptions();
    } else {
      this.setRawDashboardQuery();
    }

    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.setRawDashboardQuery();
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  onRawChangeInternal() {
    this.setTargetOptions();
    this.panelCtrl.refresh();
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

