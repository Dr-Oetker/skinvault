// Import all standard weapon images
import T_Knife from '../assets/images/standard_weapons/T_Knife.webp';
import CT_Knife from '../assets/images/standard_weapons/CT_Knife.webp';
import T_Gloves from '../assets/images/standard_weapons/T_Gloves.webp';
import CT_Gloves from '../assets/images/standard_weapons/CT_Gloves.webp';
import AK47 from '../assets/images/standard_weapons/AK-47.webp';
import AUG from '../assets/images/standard_weapons/AUG.webp';
import AWP from '../assets/images/standard_weapons/AWP.webp';
import CZ75Auto from '../assets/images/standard_weapons/CZ75-Auto.webp';
import DesertEagle from '../assets/images/standard_weapons/Desert Eagle.webp';
import DualBerettas from '../assets/images/standard_weapons/Dual Berettas.webp';
import FAMAS from '../assets/images/standard_weapons/FAMAS.webp';
import FiveSeveN from '../assets/images/standard_weapons/Five-SeveN.webp';
import G3SG1 from '../assets/images/standard_weapons/G3SG1.webp';
import GalilAR from '../assets/images/standard_weapons/Galil AR.webp';
import Glock18 from '../assets/images/standard_weapons/Glock-18.webp';
import M249 from '../assets/images/standard_weapons/M249.webp';
import M4A1S from '../assets/images/standard_weapons/M4A1-S.webp';
import M4A4 from '../assets/images/standard_weapons/M4A4.webp';
import MAC10 from '../assets/images/standard_weapons/MAC-10.webp';
import MAG7 from '../assets/images/standard_weapons/MAG-7.webp';
import MP5SD from '../assets/images/standard_weapons/MP5-SD.webp';
import MP7 from '../assets/images/standard_weapons/MP7.webp';
import MP9 from '../assets/images/standard_weapons/MP9.webp';
import Negev from '../assets/images/standard_weapons/Negev.webp';
import Nova from '../assets/images/standard_weapons/Nova.webp';
import P2000 from '../assets/images/standard_weapons/P2000.webp';
import P250 from '../assets/images/standard_weapons/P250.webp';
import P90 from '../assets/images/standard_weapons/P90.webp';
import PPBizon from '../assets/images/standard_weapons/PP-Bizon.webp';
import R8Revolver from '../assets/images/standard_weapons/R8 Revolver.webp';
import SawedOff from '../assets/images/standard_weapons/Sawed-Off.webp';
import SCAR20 from '../assets/images/standard_weapons/SCAR-20.webp';
import SG553 from '../assets/images/standard_weapons/SG 553.webp';
import SSG08 from '../assets/images/standard_weapons/SSG 08.webp';
import Tec9 from '../assets/images/standard_weapons/Tec-9.webp';
import UMP45 from '../assets/images/standard_weapons/UMP-45.webp';
import USPS from '../assets/images/standard_weapons/USP-S.webp';
import XM1014 from '../assets/images/standard_weapons/XM1014.webp';

// Import logo
import Logo from '../assets/images/logo/SV Logo.png';

// Create a mapping object for easy access
export const weaponImages = {
  'T_Knife': T_Knife,
  'CT_Knife': CT_Knife,
  'T_Gloves': T_Gloves,
  'CT_Gloves': CT_Gloves,
  'AK-47': AK47,
  'AUG': AUG,
  'AWP': AWP,
  'CZ75-Auto': CZ75Auto,
  'Desert Eagle': DesertEagle,
  'Dual Berettas': DualBerettas,
  'FAMAS': FAMAS,
  'Five-SeveN': FiveSeveN,
  'G3SG1': G3SG1,
  'Galil AR': GalilAR,
  'Glock-18': Glock18,
  'M249': M249,
  'M4A1-S': M4A1S,
  'M4A4': M4A4,
  'MAC-10': MAC10,
  'MAG-7': MAG7,
  'MP5-SD': MP5SD,
  'MP7': MP7,
  'MP9': MP9,
  'Negev': Negev,
  'Nova': Nova,
  'P2000': P2000,
  'P250': P250,
  'P90': P90,
  'PP-Bizon': PPBizon,
  'R8 Revolver': R8Revolver,
  'Sawed-Off': SawedOff,
  'SCAR-20': SCAR20,
  'SG 553': SG553,
  'SSG 08': SSG08,
  'Tec-9': Tec9,
  'UMP-45': UMP45,
  'USP-S': USPS,
  'XM1014': XM1014,
};

export const logoImage = Logo;

// Helper function to get weapon image by name
export const getWeaponImage = (weaponName: string): string => {
  return weaponImages[weaponName as keyof typeof weaponImages] || '';
};

// Helper function to get knife/gloves image by side
export const getSideImage = (type: 'knife' | 'gloves', side: 't' | 'ct'): string => {
  if (type === 'knife') {
    return side === 't' ? T_Knife : CT_Knife;
  } else {
    return side === 't' ? T_Gloves : CT_Gloves;
  }
}; 