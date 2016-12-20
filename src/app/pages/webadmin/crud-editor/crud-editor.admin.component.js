(function() {
  'use strict';

  angular
  .module('RidestoreApp.admin')
  .component('crudEditor', {
    templateUrl: 'app/pages/webadmin/crud-editor/crud-editor.admin.html',
    controller: CrudAdminEditor,
  });

  CrudAdminEditor.$inject = ['adminAuthenticationService', 'api', '$scope'];
  function CrudAdminEditor(adminAuthenticationService, api, $scope) {
    var $ctrl = this;

    $ctrl.isAdmin = adminAuthenticationService.isAdmin;
    $ctrl.deleteRow = deleteRow;
    $ctrl.pickTable = pickTable;
    $ctrl.addRow = addRow;

    activate();

    function activate() {
      $ctrl.gridOptions = setupGridOptions();
      api.crudGetTables().then(function(data) {
        $ctrl.availableTables = data.data;
      });
    }

    function setupGridOptions() {
      return {
        'data': [ ],
        'onRegisterApi': function(gridApi) {
          //set gridApi on scope
          $ctrl.gridApi = gridApi;
          gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue) {
            api.crudUpdate($ctrl.chosenTable,rowEntity);
          });
        },
        appScopeProvider: $ctrl
      };
    }

    ////////////////////////

    function deleteRow(row) {
      var index = $ctrl.gridOptions.data.indexOf(row.entity);
      $ctrl.gridOptions.data.splice(index, 1);
      api.crudDelete($ctrl.chosenTable,row.entity.id);
    }

    function addRow() {
      var newRow = {};
      $ctrl.gridOptions.data.push(newRow);
      $ctrl.gridOptions.minRowsToShow = $ctrl.gridOptions.data.length;
      $ctrl.gridOptions.virtualizationThreshold = $ctrl.gridOptions.data.length;
      api.crudCreate($ctrl.chosenTable).then(function(res) {
        newRow.id = res.data.id;
      });
    }

    function pickTable(table) {
      api.crudRead(table).then(function(res) {
        $ctrl.chosenTable = table;
        var columns = res.data.structure.map(function(table) {

          if (table.name === 'id') {
            table.enableCellEdit = false;
            table.width = '2%';
          } else {
            table.enableCellEdit = true;
          }
          if (table.type === 'bigint' || table.type ===  'int') {
            table.type = 'number';
          }
          if (table.type === 'timestamp') {
            table.type = 'date';
          }
          if (table.type === 'varchar') {
            table.type = 'string';
          }
          return table;
        });

        columns.push({
          name: 'delete',
          width: '4%',
          enableCellEdit: false,
          cellTemplate: '<button class="btn primary" ng-click="grid.appScope.deleteRow(row)">Delete</button>'
        });

        $ctrl.gridOptions.columnDefs = columns;
        $ctrl.gridOptions.minRowsToShow = res.data.data.length;
        $ctrl.gridOptions.virtualizationThreshold = res.data.data.length;
        $ctrl.gridOptions.data = res.data.data;
      });
    }
  }
})();
