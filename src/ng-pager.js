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
        $scope.pages = definePages(); /*new Array(Math.ceil($scope.total / $scope.pageCount));*/
        console.log('PAGES:', $scope.pages);

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

      /**
       * Sets dinamic list of displayed browsable pages.
       */
      function definePages() {
        
        var displaySize = (isNaN(displaySize)) ? 8 : displaySize;
        var elementsPerPage = (isNaN(elementsPerPage)) ? 10 : elementsPerPage;

        var allPages = [];
        var pages = [];
        var page = 0;

        for (var i = 0, l = Math.floor($scope.total / $scope.pageCount);
            i < l; i++) {
              allPages.push(++page);
        }

        if ($scope.total % $scope.pageCount) {
          allPages.push(++page);
        }
        
        if (allPages.length > 7) {
          pages = fixedPager($scope.page, displaySize, allPages);
          return pages;
        } else {
          return allPages;
        }
      }

      /**
       * Separates list of pages into two arrays: left and right from current page. 
       * Then concatenates both plus current page to return an array as final output.
       */
      function fixedPager(page, displaySize, allPages) {
        var leftAll = [];
        var rightAll = [];

        var leftShown = [];
        var rightShown = [];

        var zeroIndexPage = --page;

        for (var i = --zeroIndexPage; i >= 0; i--) {
          leftAll.unshift(allPages[i]);
        }

        for (var j = ++zeroIndexPage; j < allPages.length; j++) {
          rightAll.push(allPages[j]);
        }

        var bal = balance(displaySize - 2, leftAll.length, allPages);
        var balancePages = deployPages(bal, leftAll, rightAll);

        leftShown = balancePages.left;
        leftShown.push(allPages[zeroIndexPage]);
        rightShown = balancePages.right;

        var shownPages = leftShown.concat(rightShown);

        if (shownPages.length > displaySize) {
          shownPages.splice(1, 1);
        }

        return shownPages;
      }
      
      /**
       * Steps through each array of pages following the left/right balance determined by the percentage of
       * pages regarding the total. Returns two arrays containing each a selection of left and right
       * pages to display.
       */
      function deployPages(balance, leftAll, rightAll) {
        
        var leftStep = Math.ceil(leftAll.length / balance.left);
        var rightStep = Math.ceil(rightAll.length / balance.right);

        var leftSelection = [];
        var rightSelection = [];

        for (var i = 0; i < leftAll.length; i += leftStep) {
          leftSelection.push(leftAll[i]);
        }

        if (rightAll.length === 1) {
          rightSelection.push(rightAll[0]);
        } else {
          for (var j = rightAll.length - 1; j > 0; j -= rightStep) {
            rightSelection.unshift(rightAll[j]);
          }
        }

        var selection = {
          left: leftSelection,
          right: rightSelection
        };
        
        return selection;
      }
      
      /**
       * Determines the balance of pages to be shown to each the left and the right sides
       * regarding the desired total amount of pages to display.
       * */
      function balance(displaySize, leftAllLength, allPages) {
        var percentage = percent(leftAllLength, allPages.length);
        
        var leftBalance = Math.ceil((displaySize * percentage.integer) / 100);
        var rightBalance = Math.abs(displaySize - leftBalance);
        
        var balanceOut = {
          left: 0,
          right: 0
        };

        if (percentage.decimal >= 5) {
          balanceOut.left = ++leftBalance;
          balanceOut.right = rightBalance;
        } else {
          balanceOut.left = leftBalance;
          balanceOut.right = ++rightBalance;
        }
        return balanceOut;
      }

      function percent(value, total) {
        return {
          integer: Math.floor((100 * value) / total),
          decimal: Number(String(((100 * value) / total) % 1).charAt(2))
        } 
      }

      $scope.setPage = setPage;
      $scope.reset = reset;
      $scope.next = next;
      $scope.prev = prev;
      $scope.pages = definePages;
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
