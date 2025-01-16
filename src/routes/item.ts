import express from 'express';
import { ItemController } from '../controllers/item/ItemController.controller';
import { rbacMiddleware } from '../middleware/rbacMiddleware';

const router = express.Router();
/**
 * @swagger
 * /item:
 *   post:
 *     summary: Create a new item
 *     tags: 
 *       - Item
 *     security:
 *       - jwtAuth: [] # Use the jwtAuth scheme defined in the components
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               rarity:
 *                 type: number
 *               maxQuantity:
 *                 type: number
 *             required:
 *               - itemId
 *               - name
 *               - description
 *               - rarity
 *               - maxQuantity
 *     responses:
 *       201:
 *         description: Item created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('', rbacMiddleware(['superAdmin','admin']) as any,ItemController.createItem as any);


/**
 * @swagger
 * /item/id/{itemId}:
 *   get:
 *     summary: Get item details by ID
 *     tags:
 *       - Item
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to retrieve
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       description: Unique identifier for the item
 *                     name:
 *                       type: string
 *                       description: Name of the item
 *                     description:
 *                       type: string
 *                       description: Description of the item
 *                     rarity:
 *                       type: number
 *                       description: Rarity level of the item
 *                     maxQuantity:
 *                       type: number
 *                       description: Maximum quantity of the item
 *       400:
 *         description: Bad request, possibly due to missing or invalid item ID
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */

router.get('/id/:itemId', ItemController.getItemById as any);

/**
 * @swagger
 * /item/id/{itemId}:
 *   put:
 *     summary: Update item details by ID
 *     tags:
 *       - Item
 *     security:
 *       - jwtAuth: [] # Use the jwtAuth scheme defined in the components
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               rarity:
 *                 type: number
 *               maxQuantity:
 *                 type: number
 *             required:
 *               - name
 *               - description
 *               - rarity
 *               - maxQuantity
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       description: Unique identifier for the item
 *                     name:
 *                       type: string
 *                       description: Name of the item
 *                     description:
 *                       type: string
 *                       description: Description of the item
 *                     rarity:
 *                       type: number
 *                       description: Rarity level of the item
 *                     maxQuantity:
 *                       type: number
 *                       description: Maximum quantity of the item
 *       400:
 *         description: Bad request, possibly due to missing or invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.put('/id/:itemId', rbacMiddleware(['superAdmin','admin']) as any, ItemController.updateItem as any);

/**
 * @swagger
 * /item/id/{itemId}:
 *   delete:
 *     summary: Delete item by ID
 *     tags:
 *       - Item
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to delete
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       description: Unique identifier for the item
 *                     name:
 *                       type: string
 *                       description: Name of the item
 *                     description:
 *                       type: string
 *                       description: Description of the item
 *                     rarity:
 *                       type: number
 *                       description: Rarity level of the item
 *                     maxQuantity:
 *                       type: number
 *                       description: Maximum quantity of the item
 *       400:
 *         description: Bad request, possibly due to missing or invalid item ID
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/id/:itemId', rbacMiddleware(['superAdmin','admin']) as any, ItemController.deleteItemById as any);


/**
 * @swagger
 * /item:
 *   get:
 *     summary: Get all items
 *     tags:
 *       - Item
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   itemId:
 *                     type: string
 *                     description: Unique identifier for the item
 *                   name:
 *                     type: string
 *                     description: Name of the item
 *                   description:
 *                     type: string
 *                     description: Description of the item
 *                   rarity:
 *                     type: number
 *                     description: Rarity level of the item
 *                   maxQuantity:
 *                     type: number
 *                     description: Maximum quantity of the item
 *       400:
 *         description: Bad request, possibly due to invalid input
 *       500:
 *         description: Internal server error
 */

router.get('', ItemController.getItems as any);


/**
 * @swagger
 * /item/inventory:
 *   get:
 *     summary: Get inventory of the logged in user
 *     tags:
 *       - Item
 *     security:
 *       - jwtAuth: [] # Use the jwtAuth scheme defined in the components
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the item
 *                   description:
 *                     type: string
 *                     description: Description of the item
 *                   quantity:
 *                     type: integer
 *                     description: Quantity of the item
 *       400:
 *         description: Bad request, possibly due to missing or invalid authentication
 *       401:
 *         description: Unauthorized, invalid or missing token
 */
router.get('/inventory', rbacMiddleware(['player','admin','superAdmin']) as any, ItemController.getUserInventory as any);

/**
 * @swagger
 * /item/stock:
 *   post:
 *     summary: Create or update stock 
 *     tags:
 *       - Item
 *     security:
 *       - jwtAuth: [] # Use the jwtAuth scheme defined in the components
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: The ID of the item
 *               quantity:
 *                 type: number
 *                 description: The quantity of the item in stock
 *             required:
 *               - itemId
 *               - quantity
 *     responses:
 *       200:
 *         description: Stock created or updated successfully
 *       400:
 *         description: Bad request, possibly due to missing or invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/stock",  rbacMiddleware(['admin','superAdmin']) as any,ItemController.createOrUpdateStock as any);

export default router;
