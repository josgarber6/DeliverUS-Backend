const { check } = require('express-validator')
const models = require('../../models')
const FileValidationHelper = require('./FileValidationHelper')

const Product = models.Product

const maxFileSize = 10000000 // around 10Mb

module.exports = {
  create: () => {
    return [
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileIsImage(req.file)
        })
        .withMessage('Please only submit image files (jpeg, png).'),
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileMaxSize(req.file, maxFileSize)
        })
        .withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
          // SOLUTION
      check('featured')
        .custom(async (value, { req }) => {
          // SOLUTION Here I manage three cases: value is true or 'true, value is 1 or '1'
          if(value == true || value === 'true'){
            const numFeaturedProductsRestaurant = await Product.count({
              where: {
                restaurantId: req.body.restaurantId,
                featured: true
              }
            })
            if(numFeaturedProductsRestaurant > 0){
              return Promise.reject(new Error('You can only have one featured product for this restaurant')) 
            }
          }
          return Promise.resolve('ok')
        })
        .withMessage('You can only have one featured product for this restaurant')
      // SOLUTION JUAN
      //check('featured')
      //  .custom(async (value, { req }) => {
      //    try {
      //      const products = await Product.findAll({
      //        where: {
      //          featured: true,
      //          restaurantId: req.body.restaurantId
      //        }
      //      })
      //      console.log(products.length)
      //      if (products.length > 0) {
      //        return Promise.reject(new Error('More than one promoted product'))
      //      } else {
      //        return Promise.resolve('Promoted Products ok')
      //      }
      //    } catch (err) {
      //      return Promise.reject(err)
      //    }
      //  })
    ]
  },

  update: () => {
    return [
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileIsImage(req.file)
        })
        .withMessage('Please only submit image files (jpeg, png).'),
      check('image')
        .custom((value, { req }) => {
          return FileValidationHelper.checkFileMaxSize(req.file, maxFileSize)
        })
        .withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
      check('restaurantId')
        .custom(async (value, { req }) => {
          try {
            const product = await Product.findByPk(req.params.productId,
              {
                attributes: ['restaurantId']
              })
            // eslint-disable-next-line eqeqeq
            if (product.restaurantId != value) {
              return Promise.reject(new Error('The restaurantId cannot be modified'))
            } else { return Promise.resolve() }
          } catch (err) {
            return Promise.reject(new Error(err))
          }
        })
    ]
  }
}
