import { Address, User } from '../../database/index.js';
import { NotFoundError, AuthorizationError } from '../../common/errors/index.js';

export class AddressService {
  public async getAddresses(userId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isUuid) {
      return [];
    }
    return Address.findAll({
      where: { user_id: userId },
      order: [
        ['is_default_shipping', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });
  }

  public async getAddressById(userId: string, addressId: string) {
    const address = await Address.findOne({
      where: { id: addressId, user_id: userId },
    });
    if (!address) throw new NotFoundError('Address');
    return address;
  }

  public async createAddress(userId: string, data: any) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    let targetUserId = userId;

    if (isUuid) {
      const userExists = await User.findByPk(userId);
      if (!userExists) {
        const newUser = await User.create({
          id: userId,
          name: data.name || 'Patron',
          phone: data.phone || null,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        });
        targetUserId = newUser.id;
      }
    } else {
      let existing = data.phone ? await User.findOne({ where: { phone: data.phone } }) : null;
      if (!existing) {
        existing = await User.create({
          name: data.name || 'Patron',
          phone: data.phone || null,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        });
      }
      targetUserId = existing.id;
    }

    if (data.isDefaultShipping) {
      await Address.update(
        { is_default_shipping: false },
        { where: { user_id: targetUserId } }
      );
    }
    if (data.isDefaultBilling) {
      await Address.update(
        { is_default_billing: false },
        { where: { user_id: targetUserId } }
      );
    }

    return Address.create({
      user_id: targetUserId,
      name: data.name,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state,
      postal_code: data.postalCode,
      country: data.country || 'India',
      is_default_shipping: data.isDefaultShipping !== undefined ? data.isDefaultShipping : true,
      is_default_billing: data.isDefaultBilling !== undefined ? data.isDefaultBilling : true,
    });
  }

  public async updateAddress(userId: string, addressId: string, data: any) {
    const address = await this.getAddressById(userId, addressId);

    if (data.isDefaultShipping) {
      await Address.update(
        { is_default_shipping: false },
        { where: { user_id: userId } }
      );
    }
    if (data.isDefaultBilling) {
      await Address.update(
        { is_default_billing: false },
        { where: { user_id: userId } }
      );
    }

    if (data.name !== undefined) address.name = data.name;
    if (data.phone !== undefined) address.phone = data.phone;
    if (data.line1 !== undefined) address.line1 = data.line1;
    if (data.line2 !== undefined) address.line2 = data.line2;
    if (data.city !== undefined) address.city = data.city;
    if (data.state !== undefined) address.state = data.state;
    if (data.postalCode !== undefined) address.postal_code = data.postalCode;
    if (data.isDefaultShipping !== undefined) address.is_default_shipping = data.isDefaultShipping;
    if (data.isDefaultBilling !== undefined) address.is_default_billing = data.isDefaultBilling;

    await address.save();
    return address;
  }

  public async deleteAddress(userId: string, addressId: string) {
    const address = await this.getAddressById(userId, addressId);
    await address.destroy();
    return { success: true, message: 'Address deleted successfully' };
  }
}

export const addressService = new AddressService();
