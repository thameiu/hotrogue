import { Request, Response } from 'express';
import { ItemController } from './ItemController.controller';
import { ItemDAO } from '../../dao/ItemDAO';
import { initDB } from '../../db/db';
import { Item } from '../../models/Item';
import { CreateItemDto } from '../../dto/item/create-item.dto';

jest.mock('../../db/db');
jest.mock('../../dao/ItemDAO');

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('ItemController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockDB: jest.Mocked<any>;

    beforeEach(() => {
        req = {};
        res = mockResponse();
        jest.clearAllMocks();

    });

    describe('createItem', () => {
        it('should return 400 if the item DTO validation fails', async () => {
            req.body = { name: '', description: '', rarity: -1 };

            jest.spyOn(CreateItemDto, 'fromRequest').mockImplementation(() => {
                return new Error('Invalid data: name, description, and rarity are required.');
            });

            await ItemController.createItem(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid data: name, description, and rarity are required.' });
        });

        it('should return 201 if the item is created successfully', async () => {
            req.body = { name: 'New Item', description: 'New Description', rarity: 3, maxQuantity: 10 };

            const mockItem = new Item('newItemId', 'New Item', 'New Description', 3, 10);
            jest.spyOn(CreateItemDto, 'fromRequest').mockReturnValueOnce({
                itemId: 'newItemId',
                name: 'New Item',
                description: 'New Description',
                rarity: 3,
                maxQuantity: 10,
            });

            const mockItemDAO = new ItemDAO(mockDB);
            jest.spyOn(mockItemDAO, 'createItem').mockResolvedValueOnce();

            jest.spyOn(ItemDAO.prototype, 'createItem').mockImplementation(() => {
                return Promise.resolve();
            });

            await ItemController.createItem(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Item created successfully',
                user: mockItem,
            });
        });

        it('should return 400 if an error occurs during creation', async () => {
            req.body = { name: 'New Item', description: 'New Description', rarity: 3, maxQuantity: 10 };

            jest.spyOn(CreateItemDto, 'fromRequest').mockReturnValueOnce({
                itemId: 'newItemId',
                name: 'New Item',
                description: 'New Description',
                rarity: 3,
                maxQuantity: 10,
            });

            jest.spyOn(ItemDAO.prototype, 'createItem').mockRejectedValue(new Error('Database error'));

            await ItemController.createItem(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('getItems', () => {
        it('should return 200 with a list of items', async () => {
            const mockItems = [
                new Item('item1id', 'Item 1', 'Description 1', 10, 1),
                new Item('item2id', 'Item 2', 'Description 2', 20, 1),
            ];
            jest.spyOn(ItemDAO.prototype, 'getItems').mockResolvedValue(mockItems);

            await ItemController.getItems(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ items: mockItems });
        });

    });
});
