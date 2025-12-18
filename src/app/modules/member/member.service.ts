import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TMember } from './member.interface';
import { Member } from './member.model';
import { memberSearchableFields } from './member.constant';
import mongoose from 'mongoose';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import { generateStrongPassword } from '../user/user.utils';

const createMemberIntoDB = async (payload: TMember) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, lastName, email, phone } = payload;

    // 1️⃣ Check user exists
    const isExists = await User.findOne({ email });
    if (isExists) {
      throw new AppError(400, 'User already exists with this email');
    }

    // 2️⃣ Generate STRONG password (Zod compatible)
    const password = generateStrongPassword(); // 👈 plain password

    // 3️⃣ Create User (Transaction)
    await User.create(
      [
        {
          fullName: `${firstName} ${lastName}`,
          email,
          phone,
          role: 'sub-admin',

          streetAddress: 'N/A',
          city: 'N/A',
          state: 'N/A',
          zipCode: 'N/A',

          password,
          isVerified: true,
        },
      ],
      { session },
    );

    // 4️⃣ Create Member (Transaction)
    const [newMember] = await Member.create(
      [
        {
          firstName,
          lastName,
          email,
          phone,
          role: 'sub-admin',
        },
      ],
      { session },
    );

    // 5️⃣ Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // 6️⃣ Send Email (Outside Transaction)
    await sendEmail(
      email,
      'Welcome to the Admin Panel 🎉',
      `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #333;">
    
    <h2 style="color: #1f2937;">Hello ${firstName}, 👋</h2>

    <p>
      Congratulations! Your <strong>Sub-Admin</strong> account for our Admin Panel has been successfully created.
    </p>

    <p>
      You can log in using the credentials provided below:
    </p>

    <div style="background: #f1f5ff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
    </div>

    <p style="color: #b91c1c;">
      🔐 <strong>Important:</strong> For security reasons, please change your password immediately after your first login.
    </p>

    <p>
      If you encounter any issues accessing your account, feel free to contact our support team.
    </p>

    <p style="margin-top: 32px;">
      Best regards,<br />
      <strong>The Admin Panel Team</strong>
    </p>

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />

    <p style="font-size: 12px; color: #6b7280;">
      © ${new Date().getFullYear()} Admin Panel. All rights reserved.
    </p>
  </div>
  `,
    );

    return newMember;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllMembersFromDB = async (query: Record<string, unknown>) => {
  const memberQuery = new QueryBuilder(Member.find({ isDeleted: false }), query)
    .search(memberSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await memberQuery.countTotal();
  const result = await memberQuery.modelQuery;

  return { meta, result };
};

const getMemberByIdFromDB = async (id: string) => {
  const result = await Member.findById(id);

  if (!result) {
    throw new AppError(404, 'This member not found');
  }

  if (result.isDeleted === true) {
    throw new AppError(400, 'This member has been deleted');
  }

  return result;
};

const updateMemberIntoDB = async (id: string, payload: Partial<TMember>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, lastName, phone } = payload;

    // 1️⃣ Find member
    const isMemberExists = await Member.findById(id);
    if (!isMemberExists) {
      throw new AppError(404, 'Member does not exist');
    }

    if (isMemberExists.isDeleted) {
      throw new AppError(400, 'This member has been deleted');
    }

    // 2️⃣ Update Member fields
    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { firstName, lastName, phone },
      { new: true, runValidators: true, session },
    );

    if (!updatedMember) {
      throw new AppError(400, 'Member update failed');
    }

    // 3️⃣ Update User table (because create updates both)
    const updateUserData = {
      fullName: `${firstName} ${lastName}`,
      phone,
    };

    await User.findOneAndUpdate(
      { email: isMemberExists.email },
      updateUserData,
      { session },
    );

    // 4️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return updatedMember;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteMemberFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Check Member exists
    const isMemberExists = await Member.findById(id);
    if (!isMemberExists) {
      throw new AppError(404, 'Member not found');
    }

    if (isMemberExists.isDeleted === true) {
      throw new AppError(400, 'Member already deleted');
    }

    // 2️⃣ Soft delete Member (Transaction)
    const deletedMember = await Member.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedMember) {
      throw new AppError(400, 'Failed to delete member');
    }

    // 3️⃣ Soft delete linked User (Transaction)
    await User.findOneAndUpdate(
      { email: isMemberExists.email },
      { isDeleted: true },
      { session },
    );

    // 4️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return deletedMember;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const MemberServices = {
  createMemberIntoDB,
  getAllMembersFromDB,
  getMemberByIdFromDB,
  updateMemberIntoDB,
  deleteMemberFromDB,
};
