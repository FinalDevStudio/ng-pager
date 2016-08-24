(function (window) {
  'use strict';

  var ng = window.angular;

  /**
   * Pagination directive function.
   *
   * @type AngularJS Directive Function
   */
  function ngPaginationDirectiveFn($http) {
    /**
     * Pagination directive link function.
     *
     * @type AngularJS Directive Link Function
     */
    function ngPaginationDirectiveLinkFn($scope, $element, $attrs) {
      /**
       * On count request success.
       *
       * @type $http then callback.
       */
      function onCountSuccess(res) {
        $scope.total = parseInt(res.data || 0);
        $scope.pageCount = parseInt($attrs.ngpPageCount);
        $scope.pages = new Array(Math.ceil($scope.total / $scope.pageCount));

        if ($attrs.ngpStartPage) {
          $scope.page = parseInt($attrs.ngpStartPage) || 1;

          if ($scope.page > $scope.pages.length) {
            $scope.page = $scope.pages.length;
          }

          if ($scope.page < 1) {
            $scope.page = 1;
          }

          console.log('Start page: ' + $scope.page);
        }
      }

      /**
       * Sets the current page.
       *
       * @param {Number} page The page number to set.
       */
      function setPage(page) {
        $scope.page = page;
        $scope.pager(page);
      }

      /**
       * Goes to the next page.
       */
      function next() {
        if ($scope.page < $scope.pages.length) {
          setPage(++$scope.page);
        }
      }

      /**
       * Goes to the previous page.
       */
      function prev() {
        if ($scope.page > 1) {
          setPage(--$scope.page);
        }
      }

      function reset() {
        $http.get($attrs.ngpCountUrl)
          .then(onCountSuccess);
      }

      $scope.setPage = setPage;
      $scope.reset = reset;
      $scope.next = next;
      $scope.prev = prev;
      $scope.page = 1;

      reset();
    }

    /**
     * Pagination directive template URL function.
     *
     * @type AngularJS Directive Template URL Function.
     */
    function ngPaginationDirectiveTemplateUrlFn($element, $attrs) {
      return $attrs.ngpTemplateUrl;
    }

    /* Pagination directive definition */
    var ngPaginationDirectiveDef = {
      templateUrl: ngPaginationDirectiveTemplateUrlFn,

      link: ngPaginationDirectiveLinkFn,

      restrict: 'A',

      scope: {
        pager: '=ngpPager'
      }
    };

    return ngPaginationDirectiveDef;
  }

  /* Define the AngularJS module */
  ng.module('ngPager', [])

  /* Define the AngularJS directive */
  .directive('ngPager', [
    '$http',

    ngPaginationDirectiveFn
  ]);

}(window));
