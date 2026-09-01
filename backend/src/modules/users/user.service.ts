import { User, Address, Order, Wishlist } from '../../database/index.js';
import { NotFoundError } from '../../common/errors/index.js';

export class UserService {
  public async getProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'phone', 'phone_verified', 'role', 'avatar_url', 'tier', 'created_at'],
      include: [
        {
          model: Address,
          as: 'addresses',
        },
      ],
    });

    if (!user) throw new NotFoundError('User');
    return user;
  }

  public async updateProfile(userId: string, data: { name?: string; avatarUrl?: string | null }) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User');

    if (data.name !== undefined) user.name = data.name;
    if (data.avatarUrl !== undefined) user.avatar_url = data.avatarUrl;

    await user.save();
    return this.getProfile(userId);
  }
}

export const userService = new UserService();
