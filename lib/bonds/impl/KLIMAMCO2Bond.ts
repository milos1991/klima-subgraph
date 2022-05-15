import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { BondV1 } from "../../../bonds/generated/BCTBondV1/BondV1";
import { UniswapV2Pair } from "../../../bonds/generated/BCTBondV1/UniswapV2Pair";
import { getDaoIncome } from "../../../bonds/src/utils/DaoIncome";
import { IBondable } from "../IBondable";
import { IToken } from "../../tokens/IToken";

import * as constants from "../../utils/Constants";
import { toDecimal } from "../../utils/Decimals";
import { KLIMA } from "../../tokens/impl/KLIMA";
import { MCO2 } from "../../tokens/impl/MCO2";

export class KLIMAMCO2Bond implements IBondable {
  
  private contractAddress: Address;

  private klimaToken: IToken
  private mco2Token: IToken

  constructor(constractAddress: Address) {
    this.contractAddress = constractAddress;
    this.klimaToken = new KLIMA()
    this.mco2Token = new MCO2()
  }

  getToken(): IToken {
    return this.mco2Token
  }

  getBondName(): string {
    return constants.KLIMAMCO2_LPBOND_TOKEN;
  }

  getDaoIncomeForBondPayout(payout: BigDecimal): BigDecimal {
    return getDaoIncome(this.contractAddress, payout)
  }

  getBondPrice(priceInUSD: BigInt): BigDecimal {
    return toDecimal(priceInUSD, 18);
  }

  getBondTokenValueFormatted(rawPrice: BigInt): BigDecimal {
    return toDecimal(rawPrice, 18)
  }

  getCarbonCustodied(depositAmount: BigInt): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(constants.KLIMA_MCO2_PAIR))

    let total_lp = pair.totalSupply()
    let lp_token_1 = toDecimal(pair.getReserves().value0, this.klimaToken.getDecimals())
    let lp_token_2 = toDecimal(pair.getReserves().value1, this.getToken().getDecimals())
    let kLast = lp_token_1.times(lp_token_2).truncate(0).digits

    let part1 = toDecimal(depositAmount, 18).div(toDecimal(total_lp, 18))
    let two = BigInt.fromI32(2)

    let sqrt = kLast.sqrt();
    let part2 = toDecimal(two.times(sqrt), 0)
    let result = part1.times(part2)
    return result
  }

  getTreasuredAmount(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(constants.KLIMA_MCO2_PAIR))
    let lp_token_2 = toDecimal(pair.getReserves().value1, this.getToken().getDecimals())

    return lp_token_2
  }
}
