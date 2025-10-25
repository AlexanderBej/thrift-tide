import { TbHomeDollar, TbPigMoney, TbPlaneDeparture } from 'react-icons/tb';
import { FaRegLightbulb } from 'react-icons/fa';
import { GiGuitar, GiLotusFlower, GiShoppingCart, GiStairsGoal } from 'react-icons/gi';
import {
  MdDirectionsCar,
  MdLocalHospital,
  MdOutlineMovie,
  MdRestaurant,
  MdSavings,
  MdTrendingUp,
} from 'react-icons/md';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { HiOutlineBanknotes } from 'react-icons/hi2';
import { PiBookOpenTextLight, PiTreePalm, PiGraduationCapLight } from 'react-icons/pi';
import { FiShoppingBag } from 'react-icons/fi';
import { RiNetflixFill } from 'react-icons/ri';

export const CATEGORY_OPTIONS = {
  need: [
    { label: 'Rent / Mortgage', icon: TbHomeDollar, value: 'rent' },
    { label: 'Utilities', icon: FaRegLightbulb, value: 'utilities' },
    { label: 'Groceries', icon: GiShoppingCart, value: 'groceries' },
    { label: 'Transport', icon: MdDirectionsCar, value: 'transport' },
    { label: 'Insurance', icon: IoShieldCheckmarkOutline, value: 'insurance' },
    { label: 'Healthcare', icon: MdLocalHospital, value: 'healthcare' },
    { label: 'Education', icon: PiBookOpenTextLight, value: 'education' },
  ],
  want: [
    { label: 'Dining Out', icon: MdRestaurant, value: 'dining' },
    { label: 'Entertainment', icon: MdOutlineMovie, value: 'entertainments' },
    { label: 'Shopping', icon: FiShoppingBag, value: 'shopping' },
    { label: 'Travel', icon: TbPlaneDeparture, value: 'travel' },
    { label: 'Subscriptions', icon: RiNetflixFill, value: 'subscriptions' },
    { label: 'Hobbies', icon: GiGuitar, value: 'hobbies' },
    { label: 'Beauty & Wellness', icon: GiLotusFlower, value: 'beauty' },
  ],
  saving: [
    { label: 'Emergency Fund', icon: MdSavings, value: 'emergency' },
    { label: 'Investments', icon: MdTrendingUp, value: 'investment' },
    { label: 'Retirement', icon: GiStairsGoal, value: 'retirement' },
    { label: 'Big Purchase', icon: TbPigMoney, value: 'big_purchase' },
    { label: 'Vacation Fund', icon: PiTreePalm, value: 'vacation' },
    { label: 'Education Fund', icon: PiGraduationCapLight, value: 'education_fund' },
    { label: 'Debt Payments', icon: HiOutlineBanknotes, value: 'debt_payments' },
  ],
};
