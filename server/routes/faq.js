const express = require('express');
const router = express.Router();
const { FAQ } = require('../models');

router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.findAll();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add FAQ' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (faq) {
      await faq.update(req.body);
      res.json(faq);
    } else {
      res.status(404).json({ error: 'FAQ not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (faq) {
      await faq.destroy();
      res.json({ message: 'FAQ deleted' });
    } else {
      res.status(404).json({ error: 'FAQ not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

module.exports = router;
