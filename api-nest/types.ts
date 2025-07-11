export {};
declare global {
  namespace PrismaJson {
    type BranchRoleType = {
      branchId?: string;
      roles?: string[];
    }[];

    type DetailType = {
      id?: string;
      status?: string;
    }[];

    type ParticipantType = {
      id?: string;
      rank?: string;
    }[];

    type ResultType = {
      [userId: string]: {
        kihon: string;
        kata: string;
        kumite: string;
        result?: 'pass' | 'fail' | 'special';
      };
    };
  }
}
