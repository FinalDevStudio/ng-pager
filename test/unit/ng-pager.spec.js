'use strict';

/* Test the directive */
describe('The ngPager directive', function () {
  var element, $compile, $scope, $templateCache, $httpBackend;

  beforeEach(module('ngPager'));
  beforeEach(module('templates'));

  beforeEach(inject(function ($injector) {
    $templateCache = $injector.get('$templateCache');
    $httpBackend = $injector.get('$httpBackend');
    $compile = $injector.get('$compile');
    $scope = $injector.get('$rootScope');

    element = angular.element($templateCache.get('test/unit/directive.html'));

    $scope.pager = function (page) {
      $scope.currentPage = page;
      console.log('Changed page to: ' + page);
    };

    $scope.currentPage = 1;
    $scope.startPage = 1;
    $scope.limit = 10;

    $compile(element)($scope);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Actually loads', function () {
    $httpBackend.expectGET('/count').respond(200, 10);

    $scope.$digest();

    $httpBackend.flush();

    expect(element.find('li').length).to.equal(3);
  });

  it('Should add li elements properly', function () {
    $httpBackend.expectGET('/count').respond(200, 61);

    $scope.$digest();

    $httpBackend.flush();

    expect(element.find('li').length).to.equal(9);

    var next = element[0].querySelector('a#next');

    angular.element(next).triggerHandler('click');
  });

  it('Should go to the next page', function () {
    $httpBackend.expectGET('/count').respond(200, 61);

    $scope.$digest();

    $httpBackend.flush();

    expect(element.find('li').length).to.equal(9);

    var next = element.find('a#next');

    next.click();

    expect($scope.currentPage).to.equal(2);
  });

  it('Should set the start page arbitrarly', function () {
    $httpBackend.expectGET('/count').respond(200, 61);

    $scope.startPage = 6;

    $scope.$digest();

    $httpBackend.flush();

    var next = element.find('a#next');

    next.click();

    $scope.$digest();

    expect($scope.currentPage).to.equal(7);
  });

  it('Should load list of pages with an array', function () {
    $httpBackend.expectGET('/count').respond(200, 900);

    $scope.$digest();

    $httpBackend.flush();

    expect(element.find('li').length).to.equal(9);
  });

});
