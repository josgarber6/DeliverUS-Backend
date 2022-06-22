const { check } = require('express-validator')
const models = require('../../models')
const FileValidationHelper = require('./FileValidationHelper')

const Product = models.Product

const maxFileSize = 10000000 // around 10Mb

// Solution
const checkSum100 = (fats, proteins, carbohydrates) => {
  fats = parseFloat(fats)
  proteins = parseFloat(proteins)
  carbohydrates = parseFloat(carbohydrates)

  if ((fats < 0 || proteins < 0 || carbohydrates < 0) || (fats + proteins + carbohydrates) !== 100) {
    return false
  }

  return true
}

// Solution
const checkCalories = (fats, proteins, carbohydrates) => {
  fats = parseFloat(fats)
  proteins = parseFloat(proteins)
  carbohydrates = parseFloat(carbohydrates)

  const calories = fats * 9 + proteins * 4 + carbohydrates * 4

  return calories <= 1000
}

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
      // Solution
      check('fats').custom((values, { req }) => {
        const { fats, proteins, carbohydrates } = req.body
        return checkSum100(fats, proteins, carbohydrates)
      }).withMessage('The values of fat, protein and carbohydrates must be in the range [0, 100] and the sum must be 100.'),
      check('fats').custom((values, { req }) => {
        const { fats, proteins, carbohydrates } = req.body
        return checkCalories(fats, proteins, carbohydrates)
      }).withMessage('The number of calories must not be greater than 1000.')
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
        }),
      // Solution
      check('fats').custom((values, { req }) => {
        const { fats, proteins, carbohydrates } = req.body
        return checkSum100(fats, proteins, carbohydrates)
      }).withMessage('The values of fat, protein and carbohydrates must be in the range [0, 100] and the sum must be 100.'),
      check('fats').custom((values, { req }) => {
        const { fats, proteins, carbohydrates } = req.body
        return checkCalories(fats, proteins, carbohydrates)
      }).withMessage('The number of calories must not be greater than 1000.')
    ]
  }
}
