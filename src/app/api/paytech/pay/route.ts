import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { type, durationDays, userId, refCommand } = await req.json();

    if (!userId || !type || !refCommand) {
      return NextResponse.json(
        { success: false, message: "Paramètres userId, type et refCommand requis." },
        { status: 400 }
      );
    }

    // Calculer le prix
    let price = 0;
    let itemName = "";
    let commandName = "";

    if (type === 'pro') {
      price = 100;
      itemName = "Abonnement Vendeur PRO (1 mois)";
      commandName = "Abonnement PRO - SalleDeVente.sn";
    } else if (type === 'super_seller') {
      if (durationDays === 3) {
        price = 10000;
      } else if (durationDays === 7) {
        price = 20000;
      } else if (durationDays === 30) {
        price = 50000;
      } else {
        return NextResponse.json(
          { success: false, message: "Durée de badge invalide (doit être 3, 7 ou 30 jours)." },
          { status: 400 }
        );
      }
      itemName = `Badge Super-Vendeur (${durationDays} jours)`;
      commandName = "Badge Super-Vendeur - SalleDeVente.sn";
    } else {
      return NextResponse.json(
        { success: false, message: "Type de paiement invalide." },
        { status: 400 }
      );
    }

    const apiKey = process.env.PAYTECH_API_KEY;
    const apiSecret = process.env.PAYTECH_SECRET_KEY || process.env.PAYTECH_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Missing PayTech API keys in server configuration.");
      return NextResponse.json(
        { success: false, message: "Configuration serveur incomplète (Clés API PayTech manquantes)." },
        { status: 500 }
      );
    }

    // Base URL de l'application
    const baseUrl = "https://sdvmarketplace-backend--sdvmarketplace.us-east4.hosted.app";

    // Préparer la requête vers l'API de PayTech
    const payload = {
      item_name: itemName,
      item_price: price,
      currency: "XOF",
      ref_command: refCommand,
      command_name: commandName,
      env: "test", // Mode test par défaut (à passer en "prod" en production)
      ipn_url: `${baseUrl}/api/paytech/ipn`,
      success_url: `${baseUrl}/profile?payment_status=success`,
      cancel_url: `${baseUrl}/profile?payment_status=cancel`,
      custom_field: JSON.stringify({ userId, type, durationDays })
    };

    const response = await fetch("https://paytech.sn/api/payment/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API_KEY": apiKey,
        "API_SECRET": apiSecret
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success || data.redirect_url) {
      return NextResponse.json({
        success: true,
        redirect_url: data.redirect_url
      });
    } else {
      console.error("PayTech API Error response:", data);
      return NextResponse.json(
        { success: false, message: data.message || "Erreur lors de la création du lien de paiement." },
        { status: 500 }
      );
    }

  } catch (err: any) {
    console.error("Error in /api/paytech/pay route handler:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
