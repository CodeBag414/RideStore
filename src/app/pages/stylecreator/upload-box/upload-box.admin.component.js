/* global Auth0Lock */
(function () {
  angular
  .module('RidestoreApp.admin')
  .component('adminUploadBox', {
    templateUrl: 'app/pages/stylecreator/upload-box/upload-box.admin.html',
    bindings: {
      department: '='
    },
    controller: ['api','rsConfig','adminAuthenticationService','$http','$scope',
    'toastr', 'gettext',
    function (api, rsConfig, adminAuthenticationService, $http, $scope,
      toastr, gettext) {

      var vm = this;
      vm.load = false;

      vm.dropZoneSending = dropZoneSending;
      vm.uploadNewProducts = uploadNewProducts;
      vm.cleanUploadFolder = cleanUploadFolder;
      vm.dropzoneComplete = dropzoneComplete;
      vm.dropzoneConfig = {
        parallelUploads: 10,
        maxFileSize: 30,
        url: rsConfig.stylecreatorAdminApiBaseUrl + 'upload',
        clickable: true
      };

      activate();

      ////////////

      function activate() {
        stylecreatorRequest('getNumOfUploadedImages',{}).then(function(data) {
          vm.numOfUploadedFiles = data['numOfUploadedFiles'];
        });
      }

      ////////////

      function dropZoneSending(file, xhr, formData) {
        var adminToken =  adminAuthenticationService.getAdminToken();
        xhr.setRequestHeader('Authorization', 'Bearer ' + adminToken);
      }

      function dropzoneComplete(file) {
        vm.numOfUploadedFiles++;
        vm.dropzone.removeFile(file);

        // We need to scope.apply() because this function is a callback from dropzone.
        $scope.$apply();
      }

      function uploadNewProducts() {
        var checkHowManyImagesIsOnServer = setInterval(function() {
          stylecreatorRequest('getNumOfUploadedImages',{}).then(function(data) {
            vm.numOfUploadedFiles = data['numOfUploadedFiles'];
          });
        }, 1000);

        vm.updatingProducts = true;
        stylecreatorRequest('checkUpload',{
          move: true,
          addToDb: true,
          department: this.department.id
        }).then(function (data) {
          clearInterval(checkHowManyImagesIsOnServer);
          vm.updatingProducts = false;
          vm.outputCheck = data;
          vm.numOfUploadedFiles = data.numOfUploadedFiles;

          if (data.messages) {
            //This is added here for being able to see the message later.
            console.info('Stylecreator.uploadNewProducts output: ',data.messages);
            for (var i = 0; i < data.messages.length; i++) {
              var msg = {
                type: data.messages[i].type,
                body: data.messages[i].body,
                title: data.messages[i].product ? data.messages[i].product : null
              };

              displayMessage(msg);
            }
          }

          if (data.addImg) {
            displaySuccessMsg([].concat(data.addImg));
          }

        }, function (error) {
          clearInterval(checkHowManyImagesIsOnServer);
          toastr.error(gettext('Error uploading image'));
          console.error(error);
        });
      }

      function cleanUploadFolder() {
        stylecreatorRequest('cleanUploadFolder',{}).then(function (data) {
          vm.numOfUploadedFiles = data['numOfUploadedFiles'];
        }, function (error) {
          toastr.error(gettext('Error clean up folder'));
          console.error(error);
        });
      }

      function stylecreatorRequest(url, params) {
        if (typeof params !== 'object' || params === null) {
          params = {};
        }
        vm.load = true;

        return $http.get(rsConfig.stylecreatorAdminApiBaseUrl + url,{
          headers: {
            Authorization: 'Bearer ' + adminAuthenticationService.getAdminToken()
          },
          params: params,
          cache: false,
        }).then(function (result) {
          vm.load = false;
          return result.data;
        });
      }

      function displaySuccessMsg(products) {
        if (!products || products.length === 0) {
          return;
        }

        var message = {
          type: 'success',
          title: 'Added Products',
          body: 'The following products were added successfully: '
        };

        message.body += products[0];
        for (var j = 1; j < products.length; j++) {
          message.body += ', ' + products[j];
        }

        displayMessage(message);
      }

      function displayMessage(message) {
        if (!message) {
          return;
        }

        var type = message.type ? message.type : 'info';
        var title = message.title ? message.title : null;
        var body = message.body ? message.body : null;

        var options = {
          closeButton: true,
          progressBar: true,
          timeOut: 15000,
          extendedTimeOut: 10000,
        };

        if (body) {
          toastr[type](body, title, options);
        }
      }
    }]
  });
})();
