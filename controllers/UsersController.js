import crypto from 'crypto';
import dbClient from '../utils/db';
import userUtils from '../utils/user';
import { ObjectId } from 'mongodb';

export default class UsersController {
  static async postNew(req, res) {
    //const email = req.body ? req.body.email : null;
    //const password = req.body ? req.body.password : null;
    const email = req.body && req.body.email ? req.body.email : null;
    const password = req.body && req.body.password ? req.body.password : null;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    try {
      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: hashedPassword,
      });

      const newUser = {
        id: result.insertedId,
        email,
      };

      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

   static async getMe(request, response) {
    const { userId } = await userUtils.getUserIdAndKey(request);

    const user = await userUtils.getUser({
      _id: ObjectId(userId),
    });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const processedUser = { id: user._id, ...user };
    delete processedUser._id;
    delete processedUser.password;

    return response.status(200).send(processedUser);
  }
}
