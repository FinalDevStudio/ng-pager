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
        $scope.pages = definePages();       

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
       * Returns dinamic list of browsable pages to display.
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
       * Separates list of pages in two arrays: left and right from current page. 
       * Steps each array, finally returns concatenation of both stepped plus current page.
       */
      function fixedPager(page, displaySize, allPages) {
        
        var splitPages = {
          left: [],
          right: []
        };

        var zeroIndexPage = --page;

        for (var i = --zeroIndexPage; i >= 0; i--) {
          splitPages.left.unshift(allPages[i]);
        }

        for (var j = ++zeroIndexPage; j < allPages.length; j++) {
          splitPages.right.push(allPages[j]);
        }

        var bal = balance(displaySize - 2, splitPages.left.length, allPages);
        var balancePages = deployPages(bal, splitPages);

        var steppedPages = {
          left: [],
          right: [],
          all: [], //.left + current + .right

          join: function(currentPage) {
            this.left.push(currentPage);
            this.all = this.left.concat(this.right);
          }
        };

        steppedPages.left = balancePages.left;
        steppedPages.right = balancePages.right;

        steppedPages.join(allPages[zeroIndexPage]);
        
        /*leftShown = balancePages.left;
        leftShown.push(allPages[zeroIndexPage]);
        rightShown = balancePages.right;

        var shownPages = leftShown.concat(rightShown);*/

        if (steppedPages.all.length > displaySize) {
          steppedPages.all.splice(1, 1);
        }

        return steppedPages.all;
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
      
      /**
       * Steps through each array of pages following the left/right balance. 
       * Returns an object with two arrays of selected left and right pages to display.
       */
      function deployPages(balance, splitPages) {
        
        var leftStep = Math.ceil(splitPages.left.length / balance.left);
        var rightStep = Math.ceil(splitPages.right.length / balance.right);

        var selection = {
          left: [],
          right: []
        };

        var leftSelection = [];
        var rightSelection = [];

        for (var i = 0; i < splitPages.left.length; i += leftStep) {
          selection.left.push(splitPages.left[i]);
        }

        if (splitPages.right.length === 1) {
          selection.right.push(splitPages.right[0]);
        } else {
          for (var j = splitPages.right.length - 1; j > 0; j -= rightStep) {
            selection.right.unshift(splitPages.right[j]);
          }
        }
        
        return selection;
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
