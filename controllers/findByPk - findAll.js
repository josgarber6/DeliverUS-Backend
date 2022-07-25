'use strict'
const models = require('../models')
const Product = models.Product
const Restaurant = models.Restaurant

exports.indexRestaurant = async function (req, res) {
  try {
    const restaurant = await Restaurant.findAll({
      where: {
        shippingCosts: 2.5
      },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['name']
        }
      ],
      attributes: ['name']
    })
    res.json(restaurant)
    res.json(restaurant.shippingCosts)
  } catch (error) {
    res.status(404).send(error)
  }
}
