require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Service = require('../models/Service');
const AboutSection = require('../models/AboutSection');
const ContactInfo = require('../models/ContactInfo');
const User = require('../models/User');
const logger = require('./logger');

const products = [
  {
    name: 'Apple MacBook Air M3',
    slug: 'apple-macbook-air-m3',
    sku: 'APPLE-MBA-M3',
    brand: 'Apple',
    category: 'Ultrabook',
    tag: 'NEW',
    price: 109999,
    screenSize: '13"-14"',
    specs: { processor: 'Apple M3', ram: '8GB', storage: '256GB SSD', display: '13.6" Liquid Retina' },
    description: 'The Apple MacBook Air M3 delivers all-day battery life and blazing performance in a fanless design.',
    images: [],
    rating: 4.5,
    reviewCount: 128,
    stock: 15,
  },
  {
    name: 'Dell XPS 13 Plus',
    slug: 'dell-xps-13-plus',
    sku: 'DELL-XPS13-PLUS',
    brand: 'Dell',
    category: 'Ultrabook',
    price: 129999,
    screenSize: '13"-14"',
    specs: { processor: 'Intel Core i7', ram: '16GB', storage: '512GB SSD', display: '13.4" OLED' },
    rating: 5,
    reviewCount: 96,
    stock: 10,
  },
  {
    name: 'HP Spectre x360 14',
    slug: 'hp-spectre-x360-14',
    sku: 'HP-SPECTRE-X360-14',
    brand: 'HP',
    category: 'Business',
    price: 139999,
    screenSize: '13"-14"',
    specs: { processor: 'Intel Core i7', ram: '16GB', storage: '512GB SSD', display: '14" OLED Touch' },
    rating: 4,
    reviewCount: 87,
    stock: 8,
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    slug: 'lenovo-thinkpad-x1-carbon',
    sku: 'LENOVO-X1-CARBON',
    brand: 'Lenovo',
    category: 'Business',
    price: 149999,
    screenSize: '13"-14"',
    specs: { processor: 'Intel Core i7', ram: '16GB', storage: '512GB SSD', display: '14" WUXGA' },
    rating: 4.5,
    reviewCount: 74,
    stock: 12,
  },
  {
    name: 'ASUS ROG Zephyrus G14',
    slug: 'asus-rog-zephyrus-g14',
    sku: 'ASUS-ROG-G14',
    brand: 'ASUS',
    category: 'Gaming',
    price: 169999,
    screenSize: '13"-14"',
    specs: { processor: 'AMD Ryzen 9', ram: '16GB', storage: '1TB SSD', display: '14" QHD 165Hz' },
    description: 'RTX 4060 graphics in a compact, portable gaming chassis.',
    rating: 5,
    reviewCount: 65,
    stock: 6,
    // Demonstrates the dynamic Specs & Variants system: two custom fields
    // (RAM, Storage) are combined to generate four purchasable variants.
    attributes: [
      { name: 'RAM', values: ['16GB', '32GB'], useForVariants: true },
      { name: 'Storage', values: ['512GB SSD', '1TB SSD'], useForVariants: true },
    ],
    variants: [
      {
        attributes: [
          { name: 'RAM', value: '16GB' },
          { name: 'Storage', value: '512GB SSD' },
        ],
        sku: 'ASUS-ROG-G14-16-512',
        price: 169999,
        stock: 3,
        images: [],
      },
      {
        attributes: [
          { name: 'RAM', value: '16GB' },
          { name: 'Storage', value: '1TB SSD' },
        ],
        sku: 'ASUS-ROG-G14-16-1TB',
        price: 179999,
        stock: 2,
        images: [],
      },
      {
        attributes: [
          { name: 'RAM', value: '32GB' },
          { name: 'Storage', value: '512GB SSD' },
        ],
        sku: 'ASUS-ROG-G14-32-512',
        price: 189999,
        stock: 1,
        images: [],
      },
      {
        attributes: [
          { name: 'RAM', value: '32GB' },
          { name: 'Storage', value: '1TB SSD' },
        ],
        sku: 'ASUS-ROG-G14-32-1TB',
        price: 199999,
        stock: 0,
        images: [],
      },
    ],
  },
];

const services = [
  {
    title: 'Laptop Repair',
    slug: 'laptop-repair',
    description: 'Screen, keyboard, battery and motherboard repair for all major brands, done in-house.',
    icon: 'FiTool',
    price: 'Starting at Rs 499',
    order: 1,
  },
  {
    title: 'Data Recovery',
    slug: 'data-recovery',
    description: 'Recover lost files from damaged or corrupted hard drives and SSDs.',
    icon: 'FiHardDrive',
    price: 'Starting at Rs 999',
    order: 2,
  },
  {
    title: 'CCTV Installation',
    slug: 'cctv-installation',
    description: 'Professional installation and setup of smart CCTV systems for home and office.',
    icon: 'FiVideo',
    price: 'Custom quote',
    order: 3,
  },
  {
    title: 'Extended Warranty',
    slug: 'extended-warranty',
    description: 'Extend your laptop warranty beyond the manufacturer period for added peace of mind.',
    icon: 'FiShield',
    price: 'Starting at Rs 1,999/yr',
    order: 4,
  },
];

const aboutSections = [
  {
    heading: 'About My Tech Wings',
    body:
      "My Tech Wings is Chennai's trusted destination for laptops, refurbished machines, CCTV systems, and printers. " +
      'We partner directly with leading brands to bring genuine products, competitive pricing, and dependable ' +
      'after-sales support to every customer.',
    icon: 'FiMonitor',
    order: 1,
  },
  {
    heading: 'Why Choose Us',
    body:
      'Every product is inspected and warranty-backed, our in-house technicians handle repairs and installations, ' +
      "and support doesn't stop at the sale — we're a phone call or WhatsApp message away.",
    icon: 'FiShield',
    order: 2,
  },
];

const contactInfo = [
  { type: 'address', label: 'Store Address', value: 'Chennai, Tamil Nadu', icon: 'FiMapPin', order: 1 },
  { type: 'whatsapp', label: 'WhatsApp / Phone', value: '+91 94457 54129', icon: 'FiPhone', order: 2 },
  { type: 'email', label: 'Support Email', value: 'support@jirehbyte.com', link: 'mailto:support@jirehbyte.com', icon: 'FiMail', order: 3 },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('Connected for seeding');

  await Product.deleteMany({});
  await Product.insertMany(products);
  logger.info(`Seeded ${products.length} products`);

  await Service.deleteMany({});
  await Service.insertMany(services);
  logger.info(`Seeded ${services.length} services`);

  await AboutSection.deleteMany({});
  await AboutSection.insertMany(aboutSections);
  logger.info(`Seeded ${aboutSections.length} about sections`);

  await ContactInfo.deleteMany({});
  await ContactInfo.insertMany(contactInfo);
  logger.info(`Seeded ${contactInfo.length} contact info entries`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@mytechwings.com';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
    });
    logger.info(`Seeded admin user: ${adminEmail}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  logger.error(err);
  process.exit(1);
});
