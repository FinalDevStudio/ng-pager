(function(window) {
  "use strict";
  var ng = window.angular;
  function ngPaginationDirectiveFn($http) {
    function ngPaginationDirectiveLinkFn($scope, $element, $attrs) {
      function tearNumber(inputNumber) {
        var number = {
          integerVal: 0,
          decimalVal: 0,
          tear: function() {
            this.integerVal = Math.floor(inputNumber);
            this.decimalVal = inputNumber % 1;
          }
        };
        number.tear();
        return number;
      }
      function percent(leftLength, rightLength) {
        var percentages = {
          left: 0,
          right: 0,
          ruleOfThirds: function(length) {
            return 100 * length / (leftLength + rightLength);
          },
          define: function() {
            this.left = this.ruleOfThirds(leftLength);
            this.right = this.ruleOfThirds(rightLength);
          }
        };
        percentages.define();
        return percentages;
      }
      function balance(currentPage, wantedPages, lastPage, percentages) {
        var percBalance = {
          leftInt: 0,
          leftDec: 0,
          rightInt: 0,
          rightDec: 0,
          left: 0,
          right: 0,
          resWantedPages: currentPage === 1 || currentPage === lastPage ? wantedPages - 2 : wantedPages - 3,
          calculate: function() {
            this.leftInt = tearNumber(this.resWantedPages * (percentages.left / 100)).integerVal;
            this.leftDec = tearNumber(this.resWantedPages * (percentages.left / 100)).decimalVal;
            this.rightInt = tearNumber(this.resWantedPages * (percentages.right / 100)).integerVal;
            this.rightDec = tearNumber(this.resWantedPages * (percentages.right / 100)).decimalVal;
            var results = {
              left: this.leftInt,
              right: this.rightInt
            };
            if (results.left + results.right !== this.resWantedPages) {
              if (this.leftDec === this.rightDec) {
                if (results.left > results.right) {
                  results.left++;
                } else {
                  results.right++;
                }
              } else {
                if (this.leftDec > this.rightDec) {
                  results.left++;
                } else {
                  results.right++;
                }
              }
            }
            return results;
          }
        };
        return percBalance.calculate();
      }
      function paginate(currentIndex, displaySize, pages) {
        currentIndex = currentIndex < 0 ? 0 : currentIndex;
        currentIndex = currentIndex > pages.length - 1 ? pages.length - 1 : currentIndex;
        var splitPages = {
          left: [],
          right: [],
          populate: function() {
            if (currentIndex > 0) {
              for (var i = currentIndex - 1; i > 0; i--) {
                this.left.unshift(pages[i]);
              }
            }
            if (currentIndex < pages.length - 1) {
              for (var j = currentIndex + 1; j < pages.length - 1; j++) {
                this.right.push(pages[j]);
              }
            }
          }
        };
        var steppedPages = {
          left: [],
          right: [],
          leftStepping: 0,
          rightStepping: 0,
          step: function(splitPages, balance) {
            if (balance.left > 0) {
              this.leftStepping = Math.floor(splitPages.left.length / balance.left);
              for (var i = splitPages.left[splitPages.left.length - 1] + 1 - this.leftStepping; this.left.length < balance.left; i = i - this.leftStepping) {
                this.left.unshift(i);
              }
            }
            if (balance.right > 0) {
              this.rightStepping = Math.floor(splitPages.right.length / balance.right);
              for (var j = splitPages.right[0] - 1 + this.rightStepping; this.right.length < balance.right; j = j + this.rightStepping) {
                this.right.push(j);
              }
            }
          }
        };
        splitPages.populate();
        var balancePercents = percent(splitPages.left.length, splitPages.right.length);
        var balances = balance(currentIndex + 1, displaySize, pages.length, balancePercents);
        steppedPages.step(splitPages, balances);
        steppedPages.left.unshift(pages[0]);
        steppedPages.right.push(pages[pages.length - 1]);
        if (currentIndex > 0 && currentIndex < pages[pages.length]) {
          steppedPages.left.push(pages[currentIndex]);
        }
        return steppedPages.left.concat(steppedPages.right);
      }
      function pager(elements, currentPage, elementsPerPage, displaySize) {
        elementsPerPage = isNaN(elementsPerPage) ? 10 : elementsPerPage;
        displaySize = isNaN(displaySize) ? 9 : displaySize;
        if (!(displaySize % 2)) {
          console.log("[INFO]: displaySize of " + displaySize + " forced into " + (displaySize + 1));
          displaySize++;
        }
        var page = 0;
        var pages = [];
        for (var i = 0, l = Math.floor(elements / elementsPerPage); i < l; i++) {
          pages.push(++page);
        }
        if (elements % elementsPerPage !== 0) {
          pages.push(++page);
        }
        if (pages.length > displaySize) {
          var steppedPages = paginate(currentPage - 1, displaySize, pages);
          return steppedPages;
        } else {
          return pages;
        }
      }
      function onCountSuccess(res) {
        $scope.total = parseInt(res.data || 0);
        $scope.pageCount = parseInt($attrs.ngpPageCount);
        $scope.pages = pager($scope.total, $scope.page, $scope.pageCount);
        if ($attrs.ngpStartPage) {
          $scope.page = parseInt($attrs.ngpStartPage) || 1;
          if ($scope.page > $scope.pages.length) {
            $scope.page = $scope.pages.length;
          }
          if ($scope.page < 1) {
            $scope.page = 1;
          }
          console.log("Start page: " + $scope.page);
        }
      }
      function setPage(page) {
        $scope.page = page;
        $scope.pager(page);
      }
      function next() {
        if ($scope.page < $scope.pages.length) {
          setPage(++$scope.page);
        }
      }
      function prev() {
        if ($scope.page > 1) {
          setPage(--$scope.page);
        }
      }
      function reset() {
        $http.get($attrs.ngpCountUrl).then(onCountSuccess);
      }
      function definePages() {
        var displaySize = isNaN(displaySize) ? 8 : displaySize;
        var elementsPerPage = isNaN(elementsPerPage) ? 10 : elementsPerPage;
        var total = Math.floor($scope.total / $scope.pageCount);
        var allPages = [];
        var pages = [];
        var page = 0;
        for (var i = 0, l = total; i < l; i++) {
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
      function fixedPager(page, displaySize, allPages) {
        var zeroIndexPage = --page;
        var splitPages = {
          left: [],
          right: []
        };
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
          all: [],
          join: function(currentPage) {
            this.left.push(currentPage);
            this.all = this.left.concat(this.right);
          }
        };
        steppedPages.left = balancePages.left;
        steppedPages.right = balancePages.right;
        steppedPages.join(allPages[zeroIndexPage]);
        if (steppedPages.all.length > displaySize) {
          steppedPages.all.splice(1, 1);
        }
        return steppedPages.all;
      }
      function balance(displaySize, leftAllLength, allPages) {
        var percentage = percent(leftAllLength, allPages.length);
        var leftBalance = Math.ceil(displaySize * percentage.integer / 100);
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
      function deployPages(balance, splitPages) {
        var leftStep = Math.ceil(splitPages.left.length / balance.left);
        var rightStep = Math.ceil(splitPages.right.length / balance.right);
        var selection = {
          left: [],
          right: []
        };
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
          integer: Math.floor(100 * value / total),
          decimal: Number(String(100 * value / total % 1).charAt(2))
        };
      }
      $scope.setPage = setPage;
      $scope.reset = reset;
      $scope.next = next;
      $scope.prev = prev;
      $scope.page = 1;
      reset();
    }
    function ngPaginationDirectiveTemplateUrlFn($element, $attrs) {
      return $attrs.ngpTemplateUrl;
    }
    var ngPaginationDirectiveDef = {
      templateUrl: ngPaginationDirectiveTemplateUrlFn,
      link: ngPaginationDirectiveLinkFn,
      restrict: "A",
      scope: {
        pager: "=ngpPager"
      }
    };
    return ngPaginationDirectiveDef;
  }
  ng.module("ngPager", []).directive("ngPager", [ "$http", ngPaginationDirectiveFn ]);
})(window);