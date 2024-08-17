import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkingredient } from 'src/checkingredients/entities/checkingredient.entity';
import { Checkingredientitem } from 'src/checkingredientitems/entities/checkingredientitem.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCheckingredientDto } from './dto/create-checkingredient.dto';
import { SubInventory } from 'src/sub-inventories/entities/sub-inventory.entity';

@Injectable()
export class CheckingredientsService {
  constructor(
    @InjectRepository(Checkingredient)
    private checkingredientRepository: Repository<Checkingredient>,
    @InjectRepository(Checkingredientitem)
    private checkingredientitemRepository: Repository<Checkingredientitem>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SubInventory)
    private subInventoriesRepository: Repository<SubInventory>,
  ) {}
  // async create(createCheckingredientDto: CreateCheckingredientDto) {
  //   if (createCheckingredientDto.actionType === 'export') {
  //     if (createCheckingredientDto.checkingredientitems.length === 0) {
  //       const check = await this.checkingredientRepository.save(
  //         createCheckingredientDto,
  //       );
  //       return check;
  //     }
  //   }
  //   console.log(createCheckingredientDto);

  //   const user = await this.userRepository.findOneBy({
  //     userId: createCheckingredientDto.userId,
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   const checkingredient = new Checkingredient();
  //   checkingredient.user = user;
  //   checkingredient.date = createCheckingredientDto.date;
  //   checkingredient.checkDescription =
  //     createCheckingredientDto.checkDescription;
  //   checkingredient.actionType = createCheckingredientDto.actionType;

  //   const savedCheckingredient = await this.checkingredientRepository.save(
  //     checkingredient,
  //   );

  //   for (const itemDto of createCheckingredientDto.checkingredientitems) {
  //     const ingredient = await this.ingredientRepository.findOneBy({
  //       ingredientId: itemDto.ingredientId,
  //     });

  //     if (!ingredient) {
  //       throw new NotFoundException(
  //         `Ingredient with ID ${itemDto.ingredientId} not found`,
  //       );
  //     }

  //     const checkingredientitem = new Checkingredientitem();
  //     checkingredientitem.checkingredient = savedCheckingredient;
  //     checkingredientitem.ingredient = ingredient;
  //     checkingredientitem.UsedQuantity = itemDto.UsedQuantity;
  //     checkingredientitem.oldRemain = ingredient.ingredientQuantityInStock;

  //     await this.checkingredientitemRepository.save(checkingredientitem);

  //     // Update
  //     if (createCheckingredientDto.actionType === 'issuing') {
  //       ingredient.ingredientQuantityInStock -= itemDto.UsedQuantity;
  //     } else if (createCheckingredientDto.actionType === 'check') {
  //       ingredient.ingredientQuantityInStock = itemDto.UsedQuantity;
  //     } else if (createCheckingredientDto.actionType === 'export') {
  //       ingredient.ingredientQuantityInStock -= itemDto.UsedQuantity;
  //     }

  //     await this.ingredientRepository.save(ingredient);
  //   }

  //   return await this.checkingredientRepository.findOne({
  //     where: {
  //       CheckID: savedCheckingredient.CheckID,
  //     },
  //     relations: ['checkingredientitem'],
  //   });
  // }
  async create(createCheckingredientDto: CreateCheckingredientDto) {
    const user = await this.userRepository.findOneBy({
      userId: createCheckingredientDto.userId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const checkingredient = new Checkingredient();
    checkingredient.user = user;
    checkingredient.date = createCheckingredientDto.date;
    checkingredient.checkDescription =
      createCheckingredientDto.checkDescription;
    checkingredient.actionType = createCheckingredientDto.actionType;

    const savedCheckingredient = await this.checkingredientRepository.save(
      checkingredient,
    );

    for (const itemDto of createCheckingredientDto.checkingredientitems) {
      const ingredient = await this.ingredientRepository.findOneBy({
        ingredientId: itemDto.ingredientId,
      });

      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with ID ${itemDto.ingredientId} not found`,
        );
      }

      const checkingredientitem = new Checkingredientitem();
      checkingredientitem.checkingredient = savedCheckingredient;
      checkingredientitem.ingredient = ingredient;
      checkingredientitem.UsedQuantity = itemDto.UsedQuantity;
      checkingredientitem.oldRemain = ingredient.ingredientQuantityInStock;

      await this.checkingredientitemRepository.save(checkingredientitem);

      if (createCheckingredientDto.actionType === 'withdrawal') {
        ingredient.ingredientQuantityInStock -= itemDto.UsedQuantity;
      } else if (createCheckingredientDto.actionType === 'return') {
        ingredient.ingredientQuantityInStock += itemDto.UsedQuantity;
      }

      await this.ingredientRepository.save(ingredient);

      // Update SubInventory
      let subInventory = await this.subInventoriesRepository.findOne({
        where: {
          shopType: createCheckingredientDto.shopType,
          ingredient: { ingredientId: ingredient.ingredientId },
        },
      });

      if (!subInventory) {
        subInventory = new SubInventory();
        subInventory.shopType = createCheckingredientDto.shopType;
        subInventory.ingredient = ingredient;
        subInventory.quantity = itemDto.UsedQuantity;
        subInventory.createdDate = new Date();
        subInventory.updatedDate = new Date();

        await this.subInventoriesRepository.save(subInventory);
      } else {
        // Update  quantity in  SubInventory
        if (createCheckingredientDto.actionType === 'withdrawal') {
          subInventory.quantity += itemDto.UsedQuantity;
        } else if (createCheckingredientDto.actionType === 'return') {
          subInventory.quantity -= itemDto.UsedQuantity;
        }

        await this.subInventoriesRepository.save(subInventory);
      }
    }

    return await this.checkingredientRepository.findOne({
      where: { CheckID: savedCheckingredient.CheckID },
      relations: ['checkingredientitem'],
    });
  }

  async findAll(): Promise<Checkingredient[]> {
    return await this.checkingredientRepository.find({
      relations: [
        'checkingredientitem',
        'user',
        'checkingredientitem.ingredient',
      ],
    });
  }
  async findOne(id: number): Promise<Checkingredient | undefined> {
    return await this.checkingredientRepository.findOne({
      where: { CheckID: id },
      relations: [
        'checkingredientitem',
        'user',
        'checkingredientitem.ingredient',
      ],
    });
  }

  remove(id: number) {
    return `This action removes a #${id} checkingredient`;
  }
}
