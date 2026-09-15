import { User, Address, Order, Wishlist } from '../../database/index.js';
import { NotFoundError, AuthenticationError, BusinessRuleError } from '../../common/errors/index.js';
import { hashValue, verifyHash } from '../../common/utils/crypto.js';

export class UserService {
  public async getProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'phone', 'phone_verified', 'role', 'avatar_url', 'tier', 'created_at', 'password_hash'],
      include: [
        {
          model: Address,
          as: 'addresses',
        },
      ],
    });

    if (!user) throw new NotFoundError('User');
    const userJson: any = user.toJSON();
    userJson.has_password = Boolean(user.password_hash);
    delete userJson.password_hash;
    return userJson;
  }

  public async updateProfile(userId: string, data: { name?: string; avatarUrl?: string | null }) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User');

    if (data.name !== undefined) user.name = data.name;
    if (data.avatarUrl !== undefined) user.avatar_url = data.avatarUrl;

    await user.save();
    return this.getProfile(userId);
  }

  public async updatePassword(userId: string, data: { currentPassword?: string; newPassword: string }) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User');

    if (!data.newPassword || data.newPassword.length < 6) {
      throw new BusinessRuleError('New password must be at least 6 characters.');
    }

    // If account has an existing password, currentPassword is required
    if (user.password_hash) {
      if (!data.currentPassword) {
        throw new BusinessRuleError('Current password is required to change password.');
      }
      const isMatch = await verifyHash(data.currentPassword, user.password_hash);
      if (!isMatch) {
        throw new AuthenticationError('Incorrect current password.');
      }
    }

    // If account was created via Google without password, they can set new password without currentPassword
    const newHash = await hashValue(data.newPassword);
    user.password_hash = newHash;
    await user.save();

    return {
      success: true,
      message: 'Password updated successfully.',
      has_password: true,
    };
  }
}

export const userService = new UserService();
