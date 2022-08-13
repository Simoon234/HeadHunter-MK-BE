export const usersResponseAvailable = (users) => {
  return users.map((item) => {
    return {
      id: item.id,
      firstName: item.firstName,
      lastName: item.lastName,
      courseCompletion: item.courseCompletion,
      courseEngagement: item.courseEngagement,
      projectDegree: item.projectDegree,
      teamProjectDegree: item.teamProjectDegree,
      expectedTypeWork: item.expectedTypeWork,
      expectedContractType: item.expectedContractType,
      monthsOfCommercialExp: item.monthsOfCommercialExp,
      targetWorkCity: item.targetWorkCity,
      expectedSalary: item.expectedSalary,
      canTakeApprenticeship: item.canTakeApprenticeship,
    };
  });
};
