import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';
import { Cashier, CashierType } from './entities/cashier.entity';
import { User } from 'src/users/entities/user.entity';
import { CashierItem } from './entities/cashierItem.entity';
@Injectable()
export class CashiersService {
  constructor(
    @InjectRepository(Cashier)
    private cashierRepository: Repository<Cashier>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(CashierItem)
    private cashierItemRepository: Repository<CashierItem>,
  ) {}

  async create(createCashierDto: CreateCashierDto): Promise<Cashier> {
    console.log('Starting create cashier process...');
    console.log('Received createCashierDto:', createCashierDto);

    const user = await this.usersRepository.findOne({
      where: { userId: createCashierDto.userId },
    });
    console.log('Fetched user:', user);

    if (!user) {
      console.error('User not found for userId:', createCashierDto.userId);
      throw new NotFoundException('User not found.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("Today's date set to midnight:", today);

    const existingCashier = await this.cashierRepository.findOne({
      where: {
        createdDate: MoreThanOrEqual(today),
        type: createCashierDto.type,
      },
    });
    console.log('Checked for existing cashier:', existingCashier);

    if (existingCashier) {
      console.error(
        `Cashier for type ${createCashierDto.type} already exists for today.`,
      );
      throw new ConflictException(
        `Cashier for type ${createCashierDto.type} can only be created once per day.`,
      );
    }

    let cashierAmount = 0;
    console.log('Calculating cashier amount from items...');
    const cashierItems = await Promise.all(
      createCashierDto.items.map(async (item) => {
        const amount = parseFloat(item.denomination) * item.quantity;
        cashierAmount += amount;
        console.log(
          `Adding item: denomination = ${item.denomination}, quantity = ${item.quantity}, amount = ${amount}`,
        );
        return this.cashierItemRepository.create({
          denomination: item.denomination,
          quantity: item.quantity,
          timestamp: item.timestamp || new Date(),
        });
      }),
    );
    console.log('Total cashier amount calculated:', cashierAmount);

    const cashier = this.cashierRepository.create({
      cashierAmount,
      createdDate: new Date(),
      openedBy: user,
      type: createCashierDto.type,
      cashierItems: createCashierDto.items,
    });
    console.log('Created cashier entity:', cashier);

    cashierItems.forEach((item) => {
      item.cashier = cashier;
      console.log('Assigned cashier to item:', item);
    });

    await this.cashierRepository.save(cashier);
    console.log('Saved cashier to repository:', cashier);

    await this.cashierItemRepository.save(cashierItems);
    console.log('Saved cashier items to repository:', cashierItems);

    console.log('Cashier creation process completed successfully.');
    return cashier;
  }

  async checkCashierStatus(): Promise<{
    rice: { closedDate: boolean; createdToday: boolean };
    coffee: { closedDate: boolean; createdToday: boolean };
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const riceCashier = await this.cashierRepository.findOne({
      where: { type: CashierType.RICE, createdDate: MoreThanOrEqual(today) },
    });

    const coffeeCashier = await this.cashierRepository.findOne({
      where: { type: CashierType.COFFEE, createdDate: MoreThanOrEqual(today) },
    });

    return {
      rice: {
        closedDate: riceCashier ? !!riceCashier.closedDate : false,
        createdToday: !!riceCashier,
      },
      coffee: {
        closedDate: coffeeCashier ? !!coffeeCashier.closedDate : false,
        createdToday: !!coffeeCashier,
      },
    };
  }

  async isCashierCreatedToday(type: CashierType): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCashier = await this.cashierRepository.findOne({
      where: {
        type: type,
        createdDate: MoreThanOrEqual(today),
        closedDate: null,
      },
    });

    return !!existingCashier;
  }
  async findAll(): Promise<Cashier[]> {
    return await this.cashierRepository.find({
      withDeleted: true,
    });
  }

  async findOne(id: number): Promise<Cashier> {
    const cashier = await this.cashierRepository.findOne({
      where: { cashierId: id },
    });
    if (!cashier) {
      throw new HttpException('Cashier not found', HttpStatus.NOT_FOUND);
    }
    return cashier;
  }

  async update(
    id: number,
    updateCashierDto: UpdateCashierDto,
  ): Promise<Cashier> {
    await this.cashierRepository.update(id, updateCashierDto);
    const updatedCashier = await this.cashierRepository.findOne({
      where: { cashierId: id },
    });
    if (!updatedCashier) {
      throw new HttpException('Cashier not found', HttpStatus.NOT_FOUND);
    }
    return updatedCashier;
  }

  async softDelete(cashierId: number): Promise<void> {
    const result = await this.cashierRepository.softDelete(cashierId);
    if (result.affected === 0) {
      throw new HttpException('Cashier not found', HttpStatus.NOT_FOUND);
    }
  }
  async closeCashier(
    type: CashierType,
    userId: number,
    closeCashierDto: CreateCashierDto,
  ): Promise<Cashier> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCashier = await this.cashierRepository.findOne({
      where: {
        createdDate: MoreThanOrEqual(today),
        type,
        closedDate: null,
      },
    });

    if (!existingCashier) {
      throw new ConflictException(`No cashier found for type ${type} today.`);
    }
    if (existingCashier.closedDate) {
      throw new ConflictException('ไม่สามารถดำเนินการได้.');
    }

    let cashierAmount = 0;
    const cashierItems = await Promise.all(
      closeCashierDto.items.map(async (item) => {
        const amount = parseFloat(item.denomination) * item.quantity;
        cashierAmount += amount;
        return this.cashierItemRepository.create({
          denomination: item.denomination,
          quantity: item.quantity,
          timestamp: item.timestamp || new Date(),
        });
      }),
    );

    existingCashier.closedDate = new Date();
    existingCashier.closedAmount = cashierAmount;
    existingCashier.closedBy = await this.usersRepository.findOne({
      where: { userId },
    });

    await this.cashierRepository.save(existingCashier);

    cashierItems.forEach((item) => {
      item.cashier = existingCashier;
    });

    await this.cashierItemRepository.save(cashierItems);

    return existingCashier;
  }

  async paginate(page = 1, limit = 10): Promise<any> {
    const cashiers = await this.cashierRepository.findAndCount({
      take: limit,
      skip: limit * (page - 1),
    });
    return {
      data: cashiers[0],
      meta: {
        total: cashiers[1],
        page: page,
        last_page: Math.ceil(cashiers[1] / limit),
      },
    };
  }
}
