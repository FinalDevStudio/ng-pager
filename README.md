# ng-pager

Smart and simple pagination directive for AngularJS.


### Installation

Using bower, install with this command:

```sh
bower install --save ng-pager
```

Then add either the `dist/ng-pager.js` for development or the `dist/ng-pager.min.js` for production to your application scripts.

And finally, add the `ngPagination` module to your AngularJS application dependencies.


### Usage

Add a `<nav>` element with the `ng-pager` attribute to your HTML with the required options and then create the pagination directive's template.

See the [example directive](#example-directive) and [example template](#example-template).


### Options

Attribute | Value | Description
---|---|---
`ng-pager` | | This is the directive's attribute.
`ngp-template-url` | `String:URL` | Must be a string pointing to the template URL
`ngp-count-url` | `String:URL` | Must be a string pointing to the count URL. This URL will be requested via `GET` and must return an integer
`ngp-pager` | `Function` | Must be a `Function` passed by reference. It must receive a `page:Number` parameter.
`ngp-start-page` | `Number` | Must be a `Number` and will indicate in which page the pagination will start.
`ngp-page-count` | `Number` | Must be a `Number` and will be used as the amount of units per page to split the counted total.


### Template

This directive does no include a template. You must provide your own via the `ngp-template-url` attribute.

This templates are optimized for [Bootstrap](http://getbootstrap.com) pagination.


#### Example Directive

In HTML:

```html
<nav ng-pager ngp-template-url="/assets/templates/pagination.html" ngp-count-url="/api/count/things" ngp-pager="pagerFunction" ngp-start-page="1" ngp-page-count="10">
</nav>
```

In Pug:

```pug
nav.text-center(
  ngp-template-url='/assets/templates/pagination.html',
  ngp-count-url='/api/count/things',
  ngp-pager='pagerFunction',
  ngp-page-count='10',
  ngp-start-page='1',
  ng-pager)
```


#### Example Template

In HTML:

```html
<ul class="pagination">
  <li>
    <a id="prev" ng-click="prev()" role="button" href="" ng-class="{ disabled: page === 1 }">
      <span>&lt;</span>
    </a>
  </li>

  <li ng-repeat="number in pages track by $index" ng-class="{ active: page === number }">
    <a ng-attr-id="ng-pager-page-{{ number }}" ng-click="setPage(number)" role="button" href="">
      <span class="ng-binding">{{ number }}</span>
    </a>
  </li>

  <li>
    <a id="next" ng-click="next()" role="button" href="" ng-class="{ disabled: page === pages[pages.length - 1] }">
      <span>&gt;</span>
    </a>
  </li>
</ul>
```

In Pug with [FontAwesome](http://fontawesome.io) icons:

```pug
ul.pagination
  li(ng-class=`{
      disabled: page === 1
    }`)

    a(ng-click='prev()',
      role='button',
      href='')

      i.fa.fa-fw.fa-chevron-left

  li(
    ng-repeat='number in pages track by $index',
    ng-class=`{
      disabled: page === number
    }`)

    a(ng-click='setPage(number)',
      role='button',
      href='')

      span {{ number }}

  li(ng-class=`{
      disabled: page === pages[pages.length - 1]
    }`)

    a(ng-click='next()',
      role='button',
      href='')

      i.fa.fa-fw.fa-chevron-right
```


### Methods

The directive exposes various methods to the template but note that it has an isolated `$scope`:

Method | Arguments | Description
---|---|---
`reset` | | Resets and performs the count request again. This is automatically executed when the directive is parsed.
`setPage` | `Number` | Changes the pagination to that specific page.
`next` | | Goes to the next page if possible.
`prev` | | Goes to the previous page if possible.


### Values

The directive exposes only one value to the template:

Value | Description
---|---
`page` | The current page.
