import { Injectable } from "@nestjs/common";
import { Examinations } from "@prisma/client";
import { MyUserProfile } from "../auth/auth.service";

@Injectable()
export class AuthorizationService {
  isAdmin(user: MyUserProfile): boolean {
    return user.globalRoles?.includes("admin") || false;
  }

  isCoachManager(user: MyUserProfile): boolean {
    return user.globalRoles?.includes("coachManager") || false;
  }

  isCoachOfBranch(user: MyUserProfile, branchId: string | string[]): boolean {
    if (this.isAdmin(user)) {
      return true;
    }
    const branchIds = Array.isArray(branchId) ? branchId : [branchId];
    return (
      user.branchRoles?.some(
        (br) =>
          branchIds.includes(String(br.branchId)) && br.roles?.includes("coach")
      ) || false
    );
  }

  isBranchManagerOfBranch(user: MyUserProfile, branchId: string): boolean {
    if (this.isAdmin(user)) {
      return true;
    }
    return (
      user.branchRoles?.some(
        (br) => br.branchId === branchId && br.roles?.includes("branchManager")
      ) || false
    );
  }

  isBranchSupportOfBranch(user: MyUserProfile, branchId: string): boolean {
    if (this.isAdmin(user)) {
      return true;
    }
    return (
      user.branchRoles?.some(
        (br) => br.branchId === branchId && br.roles?.includes("branchSupport")
      ) || false
    );
  }

  isExaminer(user: MyUserProfile, examination?: Examinations): boolean {
    if (this.isAdmin(user)) {
      return true;
    }
    if (user.globalRoles?.includes("examiners")) {
      return true;
    }
    if (examination && examination.examiners && user.sub) {
      return examination.examiners.includes(user.sub);
    }
    return false;
  }

  hasGlobalRole(user: MyUserProfile, role: string): boolean {
    return user.globalRoles?.includes(role) || false;
  }

  hasRoleInBranch(
    user: MyUserProfile,
    branchId: string,
    role: string
  ): boolean {
    if (this.isAdmin(user)) {
      return true;
    }
    return (
      user.branchRoles?.some(
        (br) => br.branchId === branchId && br.roles?.includes(role)
      ) || false
    );
  }

  isCurrentUser(user: MyUserProfile, userId: string): boolean {
    return user.sub === userId;
  }

  isAssociatedWithAnyBranch(user: MyUserProfile): boolean {
    return (user.branchRoles?.length ?? 0) > 0;
  }
}
