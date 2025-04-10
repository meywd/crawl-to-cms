import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/languages
router.get('/languages', async (req, res) => {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
    });
    return res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/menu?languageCode=en
router.get('/menu', async (req, res) => {
  try {
    const languageCode = req.query.languageCode || 'en';
    
    const language = await prisma.language.findUnique({
      where: { code: languageCode as string },
    });
    
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    const menuItems = await prisma.menuItem.findMany({
      where: {
        languageId: language.id,
        isActive: true,
        parentId: null, // Only top level items
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        page: true,
      },
      orderBy: { order: 'asc' },
    });
    
    return res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/pages/:slug?languageCode=en
router.get('/pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const languageCode = req.query.languageCode || 'en';
    
    const language = await prisma.language.findUnique({
      where: { code: languageCode as string },
    });
    
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        contents: {
          where: { languageId: language.id },
        },
        sections: {
          where: { languageId: language.id },
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    return res.json(page);
  } catch (error) {
    console.error(`Error fetching page ${req.params.slug}:`, error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    
    // Convert array to object with key-value pairs
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    return res.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN ROUTES

// GET /api/admin/pages
router.get('/admin/pages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      include: {
        contents: {
          include: {
            language: true,
          },
        },
      },
    });
    return res.json(pages);
  } catch (error) {
    console.error('Error fetching admin pages:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// More admin routes omitted for brevity...

export default router;
