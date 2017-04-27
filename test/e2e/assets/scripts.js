(function (window) {
  'use strict';

  var ng = window.angular;

  var app = ng.module('App', [
    'ngPager'
  ]);

  function UnitController($scope) {

    function pager(page) {
      console.log('Paging', page);
    }

    $scope.test = 'Hello!';

    $scope.pager = pager;
  }

  app.controller('Unit', [
    '$scope',

    UnitController
  ]);

}(window));
