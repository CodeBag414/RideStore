(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('startController', startController);

  startController.$inject = ['$state', 'rsConfig', 'topFactory',
   'head', 'lodash', 'startFactory', 'footerFactory'];

  function startController($state, rsConfig, topFactory,
    head, lodash, startFactory, footerFactory) {

    window.performanceMark('startController:start');

    /* jshint -W040 */
    var vm = this;
    /* jshint +W040 */

    vm.openSubCategory = 'All';
    vm.activeOffset = 14 + 'px';
    vm.mediaPath = rsConfig.mediaPath;
    vm.isDepartment = false;
    vm.head = head;

    vm.changeDepartment = changeDepartment;

    vm.departments = ['Streetwear', 'Moto', 'Snow', 'Skate' , 'Girls', 'Bike'];

    var department = getDepartment($state.current);
    activateDepartment(department);

    getPosts(department);
    getMainData(department);

    ///////////////////

    function getDepartment(state) {
      if (lodash.has(state, 'params.department')) {
        return $state.current.params.department.value;
      }
      return 'Main';
    }

    function activateDepartment(department) {
      if (department !== 'Main') {
        vm.isDepartment = true;
        //set transparent header if desktop
        if (head.getDevice() === 'desktop') {
          topFactory.setState({design: 'transparent-white'});
        }
        topFactory.setActiveDepartment(department);
      }
      else {
        topFactory.setActiveDepartment('');
      }
    }

    function changeDepartment(department) {
      vm.openSubCategory = department;
      getPosts(department);
    }

    function getMainData(department) {
      var url = 'include=3&content_type=department&fields.name=' + department;
      startFactory.getContentfulData(url)
      .then(function(data) {
        vm.department = data.items[0].fields;
        //set meta
        head.setTitle(vm.department.metaTitle);
        head.setDescription(vm.department.metaDescription);
        //set footer text
        footerFactory.setSeoText(vm.department.seoText);
      });
    }

    function getPosts(department) {
      var departmentFilter = '';
      var excludeFromFeed = '';
      if (department !== 'Main') {
        departmentFilter = '&fields.department=' + department;
      }
      else {
        excludeFromFeed = '&fields.excludeFromFeed[ne]=true';
      }
      var url = 'content_type=post&order=-sys.createdAt' + excludeFromFeed + departmentFilter;
      startFactory.getContentfulData(url)
      .then(function(data) {
        vm.content = data.items;
      });
    }

    window.performanceMark('startController:end');

    window.performanceMeasure('startController', 'startController:start', 'startController:end');

  }

})();
