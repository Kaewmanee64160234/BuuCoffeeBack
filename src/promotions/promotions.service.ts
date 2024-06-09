import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreatePromotionDto,
  QueryPromotionDto,
} from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto) {
    try {
      const promotion = await this.promotionRepository.findOne({
        where: { promotionName: createPromotionDto.promotionName },
      });
      if (promotion) {
        throw new HttpException(
          'Promotion already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      const newPromotion = new Promotion();
      promotion.promotionName = createPromotionDto.promotionName;
      promotion.promotionDescription = createPromotionDto.promotionDescription;
      promotion.promotionType = createPromotionDto.promotionType;
      promotion.discountValue = createPromotionDto.discountValue;
      promotion.conditionQuantity = createPromotionDto.conditionQuantity;
      promotion.buyProductId = createPromotionDto.buyProductId;
      promotion.freeProductId = createPromotionDto.freeProductId;
      promotion.conditionValue1 = createPromotionDto.conditionValue1;
      promotion.conditionValue2 = createPromotionDto.conditionValue2;
      promotion.startDate = createPromotionDto.startDate;
      promotion.endDate = createPromotionDto.endDate;
      return this.promotionRepository.save(newPromotion);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Cannot create promotion',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  findAll() {
    try {
      return this.promotionRepository.find();
    } catch (error) {
      throw new HttpException(
        'Failed to find promotions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number) {
    try {
      return this.promotionRepository.findOne({ where: { promotionId: id } });
    } catch (error) {
      throw new HttpException(
        'Failed to find promotion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  update(id: number, updatePromotionDto: UpdatePromotionDto) {
    try {
      const promotion = this.promotionRepository.findOne({
        where: { promotionId: id },
      });
      if (!promotion) {
        throw new HttpException('Promotion not found', HttpStatus.NOT_FOUND);
      }
      const updatedPromotion = this.promotionRepository.save({
        ...promotion,
        ...updatePromotionDto,
      });
      return updatedPromotion;
    } catch (error) {
      throw new HttpException(
        'Failed to update promotion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  remove(id: number) {
    try {
      const promotion = this.promotionRepository.findOne({
        where: { promotionId: id },
      });
      if (!promotion) {
        throw new HttpException('Promotion not found', HttpStatus.NOT_FOUND);
      }
      this.promotionRepository.delete(
        this.promotionRepository.create({ promotionId: id }),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to delete promotion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCriteria(query: QueryPromotionDto): Promise<Promotion[]> {
    const queryBuilder =
      this.promotionRepository.createQueryBuilder('promotion');

    if (query.promotionName) {
      queryBuilder.andWhere('promotion.promotionName LIKE :promotionName', {
        promotionName: `%${query.promotionName}%`,
      });
    }

    if (query.promotionType) {
      queryBuilder.andWhere('promotion.promotionType = :promotionType', {
        promotionType: query.promotionType,
      });
    }

    if (query.startDate) {
      queryBuilder.andWhere('promotion.startDate >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('promotion.endDate <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.discountValue) {
      queryBuilder.andWhere('promotion.discountValue = :discountValue', {
        discountValue: query.discountValue,
      });
    }

    if (query.conditionQuantity) {
      queryBuilder.andWhere(
        'promotion.conditionQuantity = :conditionQuantity',
        { conditionQuantity: query.conditionQuantity },
      );
    }

    return queryBuilder.getMany();
  }
}
