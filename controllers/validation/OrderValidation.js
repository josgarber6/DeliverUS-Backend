const { check } = require('express-validator')
const models = require('../../models')
const Order = models.Order
const Product = models.Product

module.exports = {
  create: () => {
    return [
      check('products')
        .custom((value, { req }) => {
          // TODO: Check that the order includes some products (at least one) and each product quantity is greater than 0

          let existProduct
          let productQuantity = true
          if (req.body.products.length < 1) {
            // return Promise.reject(new Error('The order must include at leat one product'))
            existProduct = false
          } else {
            existProduct = true
            for (const product of req.body.products) {
              if (product.quantity <= 0) {
                productQuantity = false
                break
              }
            }
          }
          return productQuantity && existProduct
        })
        .withMessage('Order should have products, and all of them with quantity greater than zero'),
      check('products')
        .custom(async (value, { req }) => {
          // TODO: Check that productsIds are valid (they exists in the database), and every product belongs to the restaurant of the order

          // Una forma de hacerlo
          // let result = false
          // for (const product of req.body.products) {
          //   const databaseProduct = await Product.findByPk(product.productId)
          //   if (databaseProduct !== null) {
          //     if (databaseProduct.restaurantId === req.body.restaurantId) {
          //       result = true
          //     } else {
          //       break
          //     }
          //   } else {
          //     break
          //   }
          // }
          // return result ? Promise.resolve('ok') : Promise.reject(new Error('The products do not exist in the database'))

          for (const product of req.body.products) {
            const databaseProduct = await Product.findByPk(product.productId)
            if (databaseProduct === null) {
              return Promise.reject(new Error('The product does not exists in the database'))
            }
          }

          const orderRestaurantId = parseInt(req.body.restaurantId)
          const products = await Product.findAll({
            where: {
              id: req.body.products.map(x => x.productId)
            },
            attributes: ['restaurantId']
          })
          if (products.some(x => x.restaurantId !== orderRestaurantId)) {
            return Promise.reject(new Error('Some products does not correspond to this restaurant.'))
          } else {
            return Promise.resolve('ok')
          }
        })
    ]
  },
  confirm: () => {
    return [
      check('startedAt')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['startedAt']
              })
            if (order.startedAt) {
              return Promise.reject(new Error('The order has already been started'))
            } else {
              return Promise.resolve('ok')
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  },
  send: () => {
    return [
      check('sentAt')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['startedAt', 'sentAt']
              })
            if (!order.startedAt) {
              return Promise.reject(new Error('The order is not started'))
            } else if (order.sentAt) {
              return Promise.reject(new Error('The order has already been sent'))
            } else {
              return Promise.resolve('ok')
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  },
  deliver: () => {
    return [
      check('deliveredAt')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['startedAt', 'sentAt', 'deliveredAt']
              })
            if (!order.startedAt) {
              return Promise.reject(new Error('The order is not started'))
            } else if (!order.sentAt) {
              return Promise.reject(new Error('The order is not sent'))
            } else if (order.deliveredAt) {
              return Promise.reject(new Error('The order has already been delivered'))
            } else {
              return Promise.resolve('ok')
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  }
}
