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
       * Main pagination function. Determine if the smart-pagination algorithm is needed or not. Display all pages if not.
       *
       * @param {Number} items Total amount of items to sort
       * @param {Number} currentPage Non-zero based index for the current page
       * @param {Number} itemsPerPage Amount of items to display on each page (Default: 10)
       * @param {Number} displaySize Limit of pages to display. Must be an odd number (Default: 9)
       *
       * @returns {Array} List of pages the pagination element will display
       */
      function pager(items, currentPage, itemsPerPage, displaySize) {
        itemsPerPage = (isNaN(itemsPerPage)) ? 10 : itemsPerPage;
        displaySize = (isNaN(displaySize)) ? 9 : displaySize;

        if (!(displaySize % 2)) { // Check if NOT odd
          console.log('[INFO]: displaySize of ' + displaySize + ' forced into ' + (displaySize + 1));
          displaySize++;
        }

        var page = 0;
        var pages = [];

        for (var i = 0, l = Math.floor(items / itemsPerPage); i < l; i++) {
          pages.push(++page);
        }

        if (items % itemsPerPage !== 0) {
          pages.push(++page);
        }

        if (pages.length > displaySize) {
          var steppedPages = paginate(currentPage - 1, displaySize, pages);
          return steppedPages;
        } else {
          return pages;
        }
      }

      /**
       * Smart-pagination algorithm function.
       *
       * @param {Number} currentIndex Current page
       * @param {Number} displaySize Limit of pages to display. Must be an odd number
       * @param {Array} pages Array of all pages
       *
       * @returns {Array} Filtered list of pages to display
       */
      function paginate(currentIndex, displaySize, pages) {
        currentIndex = (currentIndex < 0) ? 0 : currentIndex;
        currentIndex = (currentIndex > (pages.length - 1)) ? (pages.length - 1) : currentIndex;

        var splitPages = {
          left: [],
          right: [],

          populate: function () {
            var i;

            if (currentIndex > 0) {
              for (i = (currentIndex - 1); i > 0; i--) {
                this.left.unshift(pages[i]);
              }
            }

            if (currentIndex < (pages.length - 1)) {
              for (i = (currentIndex + 1); i < (pages.length - 1); i++) {
                this.right.push(pages[i]);
              }
            }
          }
        };

        var results = {
          left: [],
          right: [],
          all: [],

          join: function () {
            this.left.unshift(pages[0]);
            this.right.push(pages[pages.length - 1]);

            if (currentIndex > 0 && (currentIndex + 1) < pages[pages.length - 1]) {
              this.left.push(pages[currentIndex]);
            }

            this.all = this.left.concat(this.right);
            return this.all;
          }
        };

        var steppedPages = {
          leftStepping: 0,
          rightStepping: 0,

          step: function (splitPages, balance) {
            var i;

            if (balance.left > 0) {
              this.leftStepping = Math.floor(splitPages.left.length / balance.left);

              for (i = (splitPages.left[splitPages.left.length - 1] + 1) - this.leftStepping; results.left.length < balance.left; i = (i - this.leftStepping)) {
                results.left.unshift(i);
              }
            }

            if (balance.right > 0) {
              this.rightStepping = Math.floor(splitPages.right.length / balance.right);

              for (i = (splitPages.right[0] - 1) + this.rightStepping; results.right.length < balance.right; i = (i + this.rightStepping)) {
                results.right.push(i);
              }
            }
          }
        };

        splitPages.populate();

        var balancePercents = percent(splitPages.left.length, splitPages.right.length);
        var balances = balance((currentIndex + 1), displaySize, pages.length, balancePercents);

        steppedPages.step(splitPages, balances);

        var output = results.join();

        return output;
      }

      /**
       * Determine the balance of pages to the left and right judging from the current page the user is at.
       *
       * @param {Number} currentPage Current page the user is at
       * @param {Number} displaySize Limit of pages to display
       * @param {Number} lastPage Value at the last index of the pages array
       * @param {Object} percentages Percentages object
       *
       * @returns {Object} Left/Right results object
       */
      function balance(currentPage, displaySize, lastPage, percentages) {
        displaySize = (currentPage === 1 || currentPage === lastPage) ? (displaySize - 2) : (displaySize - 3);

        var results = {
          left: tearNumber(displaySize * (percentages.left / 100)).integerVal,
          right: tearNumber(displaySize * (percentages.right / 100)).integerVal
        };

        var leftDecimal = tearNumber(displaySize * (percentages.left / 100)).decimalVal;
        var rightDecimal = tearNumber(displaySize * (percentages.right / 100)).decimalVal;

        if ((results.left + results.right) !== displaySize) {
          if (leftDecimal === rightDecimal) {
            if (results.left > results.right) {
              results.left++;
            } else {
              results.right++;
            }
          } else {
            if (leftDecimal > rightDecimal) {
              results.left++;
            } else {
              results.right++;
            }
          }
        }

        return results;
      }

      /**
       * Determine percentage of two arrays taking both summed as total.
       *
       * @param {Array} leftLength Left array
       * @param {Array} rightLength Right array
       *
       * @returns {Object} Returns percentages object
       */
      function percent(leftLength, rightLength) {
        var percentages = {
          right: 0,
          left: 0,

          ruleOfThree: function (length) {
            return (100 * length) / (leftLength + rightLength);
          },

          define: function () {
            this.left = this.ruleOfThree(leftLength);
            this.right = this.ruleOfThree(rightLength);
          }
        };

        percentages.define();

        return percentages;
      }

      /**
       * Separate a number into its integer and decimal parts
       *
       * @param {Number} inputNumber Number to tear
       *
       * @returns {Object} Torn number object
       */
      function tearNumber(number) {
        var tornNumber = {
          integerVal: Math.floor(number),
          decimalVal: (number % 1)
        };

        return tornNumber;
      }

      /**
       * Re-generate on refresh or page change
       */
      function generatePagesArray() {
        $scope.pages = pager($scope.total, $scope.page, $scope.pageCount, $scope.pagesLimit);

        $scope.lastPage = $scope.page === $scope.pages[$scope.pages.length - 1];
        $scope.firstPage = $scope.page === $scope.pages[0];
      }

      /**
       * On count request success.
       *
       * @type $http then callback.
       */
      function onCountSuccess(res) {
        $scope.pagesLimit = parseInt($attrs.ngpPagesLimit || 7);
        $scope.total = parseInt(res.data || 0);
        $scope.pageCount = parseInt($attrs.ngpPageCount);
        $scope.disabled = false;

        generatePagesArray();

        if ($attrs.ngpStartPage) {
          $scope.page = parseInt($attrs.ngpStartPage) || 1;

          var lastPage = $scope.pages[$scope.pages.length - 1];

          if ($scope.page > lastPage) {
            $scope.page = lastPage;
          }

          if ($scope.page < 1) {
            $scope.page = 1;
          }

          console.log('Start page: ' + $scope.page);
        }

        generatePagesArray();
      }

      /**
       * Sets the current page.
       *
       * @param {Number} page The page number to set.
       */
      function setPage(page) {
        page = parseInt(page);

        console.log('Current scope page:', $scope.page);
        console.log('Trying to set page:', page);

        if (!isNaN(page) && $scope.page !== page) {
          console.log('New page:', page);

          $scope.page = page;
          $scope.pager(page);

          generatePagesArray();
        }
      }

      /**
       * Goes to the next page.
       */
      function next() {
        if ($scope.page < $scope.pages[$scope.pages.length - 1]) {
          setPage($scope.page + 1);
        }
      }

      /**
       * Goes to the previous page.
       */
      function prev() {
        if ($scope.page > $scope.pages[0]) {
          setPage($scope.page - 1);
        }
      }

      /**
       * Resets the counter and fetches the total count again.
       */
      function reset() {
        $http.get($attrs.ngpCountUrl)
          .then(onCountSuccess, ng.noop);
      }

      $scope.setPage = setPage;
      $scope.reset = reset;
      $scope.next = next;
      $scope.prev = prev;

      $scope.firstPage = false;
      $scope.lastPage = false;
      $scope.disabled = true;
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