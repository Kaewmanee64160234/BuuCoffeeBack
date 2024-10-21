import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

let customerId = 0;
@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  create(createCustomerDto: CreateCustomerDto) {
    try {
      const newCustomer = new Customer();
      newCustomer.customerId = customerId++;
      newCustomer.customerName = createCustomerDto.customerName;
      newCustomer.customerNumberOfStamp =
        createCustomerDto.customerNumberOfStamp;
      newCustomer.customerPhone = createCustomerDto.customerPhone;

      return this.customersRepository.save(newCustomer);
    } catch (error) {
      throw new HttpException(
        'Failed to create customers',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findAll() {
    try {
      return this.customersRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch customers',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number) {
    try {
      const customer = this.customersRepository.findOne({
        where: { customerId: id },
      });
      if (!customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return customer;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch customer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    try {
      const customer = this.customersRepository.findOne({
        where: { customerId: id },
      });
      if (!customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return this.customersRepository.update(id, updateCustomerDto);
    } catch (error) {
      throw new HttpException(
        'Failed to update customer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  remove(id: number) {
    try {
      const customer = this.customersRepository.findOne({
        where: { customerId: id },
      });
      if (!customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return this.customersRepository.delete(id);
    } catch (error) {
      throw new HttpException(
        'Failed to update customer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findCustomerByName(name: string) {
    try {
      const customer = this.customersRepository.findOne({
        where: {
          customerName: Like(`%${name}%`),
          customerPhone: Like(`%${name}%`),
        },

        relations: ['customer'],
        order: { customerName: 'ASC' },
      });
      return customer;
    } catch (e) {
      console.log(e);
    }
  }

  async getCustomers(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ data: Customer[]; total: number }> {
    const whereCondition = search ? { customerName: Like(`%${search}%`) } : {};

    const [data, total] = await this.customersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: whereCondition,
    });

    return { data, total };
  }
}
