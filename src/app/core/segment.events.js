'use strict';

angular
.module('RidestoreApp')
.constant('SegmentEvents', {
  VIEWED_CHECKOUT : 'Viewed Checkout',
  LOGIN_SUCCESS : 'Login Success',
  LOGIN_FAILED : 'Login Failed',
  ORDER_COMPLETED : 'Order Completed',
  CHECKOUT_STARTED : 'Checkout Started',
  CHECKOUT_ENTERED_ADDRESS : 'Checkout Entered Address',
  CART_VIEWED : 'Cart Viewed',
  PRODUCTS_SEARCHED: 'Products Searched',
  PRODUCT_VIEWED : 'Product Viewed',
  STYLE_VIEWED : 'Style Viewed',
  PRODUCTS_ADDED_FROM_STYLE : 'Products Added From Style',
  PRODUCT_ADDED : 'Product Added',
  PRODUCT_REMOVED : 'Product Removed ',
  PRODUCT_ADDED_TO_WISHLIST : 'Product Added to Wishlist',
  PRODUCT_REMOVED_FROM_WISHLIST : 'Product Removed from Wishlist',
  PRODUCT_SHARED : 'Product Shared',
  WISHLIST_SHARED : 'Wishlist Shared',
  PRODUCT_LIST_VIEWED : 'Product List Viewed',
  PRODUCT_LIST_FILTERED : 'Product List Filtered',
  STYLECREATOR_VIEWED : 'Stylecreator Viewed',
  STYLECREATOR_GENERATED_STYLE : 'Stylecreator Generated Style',
  STYLECREATOR_SHARED : 'Stylecreator Shared',
  PROMOTION_VIEWED :  'Promotion Viewed',
  PROMOTION_CLICKED : 'Promotion Clicked',
  COUPON_ENTERED : 'Coupon Entered',
  COUPON_APPLIED : 'Coupon Applied',
  COUPON_DENIED : 'Coupon Denied',
  EXPERIMENT_VIEWED: 'Experiment Viewed',
});
