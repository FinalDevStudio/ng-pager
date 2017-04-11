(function (window) {
  'use strict';

  var ng = window.angular;

  var app = ng.module('App', [
    'ngPager'
  ]);

  function UnitController($scope) {
    $scope.test = 'Hello!';
  }

  app.controller('Unit', [
    '$scope',

    UnitController
  ]);

}(window));