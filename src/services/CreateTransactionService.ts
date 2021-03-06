import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Transaction type invalid.');
    }

    const createCategory = new CreateCategoryService();
    const checkCategory = await createCategory.execute({
      title: category,
    });

    // Alternativa para não utilizar o arquivo CreateCategoryService.ts

    // const categoryRepository = getRepository(Category);

    // let transactionCategory = await categoryRepository.findOne({
    //   where: { title: category },
    // });

    // if (!transactionCategory) {
    //   transactionCategory = categoryRepository.create({
    //     title: category,
    //   });

    //   await categoryRepository.save(transactionCategory);
    // }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError("You don't have enough balance!");
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: checkCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
