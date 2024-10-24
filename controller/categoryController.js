const User = require('../model/userModel');
const Category = require('../model/categoryModel');
const Product = require('../model/productModel');
const { query } = require('express');




const loadCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';

        const query = {
            $or: [
                { categoryName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };

        const totalCategories = await Category.countDocuments(query);
        const totalPages = Math.ceil(totalCategories / limit);
        const skip = (page - 1) * limit;

        const categories = await Category.find(query)
            .skip(skip)
            .limit(limit);

        res.render('categoryList', {
            categories,
            search,
            currentPage: page,
            totalPages,
            totalCategories,
            pages: Array.from({ length: totalPages }, (_, i) => i + 1)
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
// categoryController.js
const addCategory = async (req, res) => {
    try {
        const { categoryName, description, status } = req.body;
        
        // Validate for empty or whitespace-only inputs
        if (!categoryName.trim() || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name and description cannot be empty!'
            });
        }

        // Check if category exists (case-insensitive)
        const existingCategory = await Category.findOne({ 
            categoryName: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') } 
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists!'
            });
        }

        // Create new category with trimmed values
        const newCategory = new Category({ 
            categoryName: categoryName.trim(), 
            description: description.trim(), 
            status 
        });
        await newCategory.save();

        res.status(200).json({
            success: true,
            message: 'Category added successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const editCategory = async (req, res) => {
    try {
        const { id, categoryName, description, status } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(id, { categoryName, description, status }, { new: true });

        if (updatedCategory) {
            res.redirect('/admin/dashboard/categoryList');
        } else {
            res.redirect('/admin/dashboard/categoryList', { message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const toggleCategoryStatus = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category.is_delete = !category.is_delete;
        await category.save();

        res.status(200).json({
            success: true,
            message: `Category ${category.is_delete ? 'unlisted' : 'listed'} successfully!`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const listCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        await Category.findByIdAndUpdate(categoryId, { is_delete: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

const unlistCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        await Category.findByIdAndUpdate(categoryId, { is_delete: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

module.exports={
    loadCategory,
    addCategory,
    editCategory ,
    toggleCategoryStatus,
    listCategory,
    unlistCategory,  
}