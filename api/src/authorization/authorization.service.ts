import { Injectable } from "@nestjs/common";
import { Events, Examinations } from "@prisma/client";
import { MyUserProfile } from "../auth/auth.service";

@Injectable()
export class AuthorizationService {
  isAdmin(user: MyUserProfile) {
    return user.globalRoles.includes("admin");
  }

  isCurrentUser(user: MyUserProfile, id: string) {
    if (this.isAdmin(user)) {
      return true;
    }
    return user.sub === id;
  }

  isCoachManager(user: MyUserProfile) {
    if (this.isAdmin(user)) {
      return true;
    }
    return user.globalRoles.includes("coachManager");
  }

  isBranchManager(user: MyUserProfile, branchId: string) {
    if (this.isAdmin(user)) {
      return true;
    }
    return user.branchRoles.some(
      (br) => br.branchId === branchId && br.roles.includes("branchManager")
    );
  }

  isBranchSupport(user: MyUserProfile, branchId: string) {
    if (this.isAdmin(user)) {
      return true;
    }
    return user.branchRoles.some(
      (br) => br.branchId === branchId && br.roles.includes("branchSupport")
    );
  }

  isCoach(user: MyUserProfile, branchId: string | string[]) {
    if (this.isAdmin(user)) {
      return true;
    }
    const branchIdArray = Array.isArray(branchId) ? branchId : [branchId];
    return user.branchRoles.some((br) =>
      branchIdArray.includes(String(br.branchId))
    );
  }

  isMember(user: MyUserProfile, branchId: string) {
    if (this.isAdmin(user)) {
      return true;
    }
    return user.branchRoles.some(
      (br) => br.branchId === branchId && br.roles.includes("member")
    );
  }

  isExaminer(user: MyUserProfile, examination?: Examinations, event?: Events) {
    if (this.isAdmin(user)) {
      return true;
    }
    if (examination) {
      return examination.examiners.includes(String(user.sub));
    }
    if (event) {
      return event.examiners.includes(String(user.sub));
    }
  }

  isUnAssociated(user: MyUserProfile) {
    if (this.isAdmin(user)) {
      return true;
    }
    return user.globalRoles.includes("unAssociated");
  }
}
