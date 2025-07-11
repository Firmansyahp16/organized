import {injectable} from '@loopback/core';
import {MyUserProfile} from './user.service';
import {Examinations} from '../models';

@injectable()
export class AuthorizationService {
  isCoachOrAdmin(user: MyUserProfile, branchId: string | string[]): boolean {
    const branchIds = Array.isArray(branchId) ? branchId : [branchId];
    return (
      user.globalRoles?.includes('admin') ||
      user.branchRoles?.some(
        br =>
          branchIds.includes(String(br.branchId)) &&
          br.roles?.includes('coach'),
      )
    );
  }

  isMemberOfBranch(user: MyUserProfile, branchId: string): boolean {
    return user.branchRoles?.some(br => br.branchId === branchId);
  }

  hasRoleInBranch(
    user: MyUserProfile,
    branchId: string,
    role: string,
  ): boolean {
    return user.branchRoles?.some(
      br => br.branchId === branchId && br.roles?.includes(role),
    );
  }

  hasGlobalRole(user: MyUserProfile, role: string): boolean {
    return user.globalRoles?.includes(role);
  }

  isCurrentUser(user: MyUserProfile, userId: string): boolean {
    return user.id === userId;
  }

  isExaminers(user: MyUserProfile, examination: Examinations): boolean {
    return (
      examination.examiners?.includes(user.id!) ||
      user.globalRoles?.includes('examiners')
    );
  }
}
