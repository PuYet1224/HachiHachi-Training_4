export enum TypeStaff {
  Type1 = 'Type1',
  Type2 = 'Type2'
}

export interface DTOHRDecisionTaskLog {
  logId: number;
  status: string;
  timestamp: Date;
}

export interface JobNameDTO {
  Code: number;
  TaskName: string;
  Description: string;
  AssigneeBy: string;
  PositionApprovedName: string;
  OrderBy: number;
  DateDuration: number;
  PositionAssignee: number;
  PositionApproved: number;
  StartDate: string;
  EndDate: string;
  Status: number;
  Remark: string;
  Assignee: number;
  AssigneeName: string;
  AssigneeID: string;
  AssigneePositionName: string;
  ListHRDecisionTaskLog: DTOHRDecisionTaskLog[];
  Approved: number;
  ApprovedID: string;
  ApprovedName: string;
  ApprovedPositionName: string;
  TotalWorkingTask: number;
  TotalNotTask: number;
  TotalPauseTask: number;
  TotalDoneTask: number;
  TotalOverdueTask: number;
  TotalSentTask: number;
  ApprovedPositionID: string;
  IsOverdue: boolean;
  ListOfTypeStaff: TypeStaff[];
  FullName: string;
  StaffID: string;
  RemainingDate: Date;
  Reason: number;
  ReasonDescription: string;
  SentDate?: string;
  CompletedDate?: string;
  StoppedDate?: string;
  NotExecutedDate?: string;
}
