export class UserDto {
  id!: number;

  name!: string;

  email!: string;

  createdAt!: Date;

  updatedAt!: Date;
}

export class UserListResponseDto {
  data!: UserDto[];

  total!: number;

  page!: number;

  limit!: number;
}
