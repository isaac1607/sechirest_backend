import { InitService } from "../services/initServices.js";



export class InitController {
    constructor() {
        this.initService = new InitService();
    }
    

    villeCommune = async (req, res) => {
        try {
            // data
            const data = [
                {
                    ville: "Abidjan",
                    commune: ["Abobo","Adjamé","Attécoubé","Anyama","Cocody","Marcory","Koumassi","Plateau","Port-Bouët","Treichville","Vridi","Yopougon"]
                }
            ];
            
            // Récupération des données
            const result = await this.initService.initierVille(data);
            return res.status(result.status).json({ message: result.message });
        } catch (error) {
            return res.status(500).json({ 
                message: "Une erreur interne est survenue" 
            });
        }
    }

}