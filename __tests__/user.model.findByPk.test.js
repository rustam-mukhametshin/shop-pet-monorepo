const { ObjectId } = require('mongodb');
const { UserModel } = require('../models/user.model.ts');

describe('UserModel.findByPk', () => {
  test('queries by ObjectId and maps _id to id', async () => {
    const rawId = new ObjectId().toString();
    const dbDoc = {
      _id: new ObjectId(rawId),
      email: 'test@example.com',
      username: 'test',
    };

    const next = jest.fn().mockResolvedValue(dbDoc);
    const find = jest.fn().mockReturnValue({ next });

    const collectionSpy = jest
      .spyOn(UserModel, 'collection')
      .mockReturnValue({ find });

    const result = await UserModel.findByPk(rawId);

    expect(collectionSpy).toHaveBeenCalledWith('users');
    expect(find).toHaveBeenCalledTimes(1);
    expect(find.mock.calls[0][0]._id).toBeInstanceOf(ObjectId);
    expect(find.mock.calls[0][0]._id.toString()).toBe(rawId);
    expect(result).toMatchObject({
      email: 'test@example.com',
      username: 'test',
      id: rawId,
    });

    collectionSpy.mockRestore();
  });
});

