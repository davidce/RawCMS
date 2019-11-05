import { epicSpinners } from '../../../../utils/spinners.js';
import { snackbarService } from '../../../core/services/snackbar-service.js';
import { BaseCrudService } from '../../../shared/services/base-crud-service.js';

const _rawCmsListName = 'raw-cms-list';

const _RawCmsListDef = async () => {
  const tpl = await RawCMS.loadComponentTpl('/modules/shared/components/list/list.tpl.html');

  return {
    components: {
      AtomSpinner: epicSpinners.AtomSpinner,
    },
    created: function() {
      this.fetchEntities();
    },
    data: function() {
      return {
        apiService: this.apiBasePath ? new BaseCrudService({ basePath: this.apiBasePath }) : null,
        isLoading: true,
        currentItem: {},
        isDeleteConfirmVisible: false,
        items: [],
      };
    },
    methods: {
      fetchEntities: async function() {
        // FIXME: Pagination
        const res = await this.apiService.getPage();
        this.items = res.map(x => {
          return { ...x, _meta_: { isDeleting: false } };
        });
        this.isLoading = false;
      },
      goTo: function(id) {
        if (!this.detailRouteName) {
          console.warn('"detailRouteName" prop was not defined, cannot go to detail view.');
          return;
        }

        this.$router.push({ name: this.detailRouteName, params: { id: id } });
      },
      showDeleteConfirm: function(item) {
        this.currentItem = item;
        this.isDeleteConfirmVisible = true;
      },
      dismissDeleteConfirm: function() {
        this.isDeleteConfirmVisible = false;
      },
      deleteConfirmMsg(item) {
        return this.$t('core.common.deleteConfirmMsgTpl', { id: item._id });
      },
      deleteSuccessMsg(item) {
        return this.$t('core.common.deleteSuccessMsgTpl', { id: item._id });
      },
      deleteErrorMsg(item) {
        return this.$t('core.common.deleteErrorMsgTpl', { id: item._id });
      },
      deleteEntity: async function(item) {
        this.dismissDeleteConfirm();
        item._meta_.isDeleting = true;
        const res = await this.apiService.delete(item._id);
        item._meta_.isDeleting = false;
        if (!res) {
          snackbarService.showMessage({
            color: 'error',
            message: this.deleteErrorMsg(item),
          });
          return;
        }
        this.items = this.items.filter(x => x._id !== item._id);
        snackbarService.showMessage({
          color: 'success',
          message: this.deleteSuccessMsg(item),
        });
      },
    },
    name: _rawCmsListName,
    props: {
      apiBasePath: String,
      detailRouteName: String,
    },
    template: tpl,
    watch: {
      $route: 'fetchData',
    },
  };
};

const _RawCmsList = async (res, rej) => {
  const cmpDef = _RawCmsListDef();
  res(cmpDef);
};

export const RawCmsListDef = _RawCmsListDef;
export const RawCmsList = _RawCmsList;
export default _RawCmsList;
