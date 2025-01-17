const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios'); // HTTP istekleri için

// Botunuzu başlatmak için bir istemci oluşturun
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Bot tokeni
const TOKEN = 'MTMyOTYyNTQ5ODA2MTM3NzU1Nw.GhvK8L.SAn59gC8YU-YLm563uGdFfry_GsTCTLzKEMrFQ'; // Buraya geçerli bot tokenini ekleyin
            ///////////////////////
            //SUNUCU DURUMU KODU///
            ///////////////////////
// Sunucu ID'lerini tutmak için bir dizi
const serverIds = [
  '31261012', // Sunucu 1
  '31278507', // Sunucu 2
  '31336268', // Sunucu 3
  '31441110', // Sunucu 4
  '31460793', // Sunucu 5
];

// Bot çalıştığında bu tetiklenir
client.once('ready', () => {
  console.log(`${client.user.tag} çalışıyor!`);

  // Sunucu durumlarını her dakika güncellemek için setInterval
  setInterval(async () => {
    // Sunucu verilerini almak ve göndermek için bir işlev çağırıyoruz
    await updateServerStatus();
  }, 60000); // 60000 ms = 1 dakika
});

// Sunucu durumu güncelleme fonksiyonu
async function updateServerStatus() {
  try {
    const serverPromises = serverIds.map(async (serverId) => {
      // BattleMetrics API'den her sunucu için durum alma
      const response = await axios.get(`https://api.battlemetrics.com/servers/${serverId}`);
      return response.data.data.attributes;
    });

    // Tüm sunucu verilerini aynı anda almak için Promise.all kullanıyoruz
    const serverDataArray = await Promise.all(serverPromises);

    // Embed mesajı oluşturma
    const embed = new EmbedBuilder()
      .setTitle('Sunucu Durumları')
      .setColor('#00FF00'); // Embed rengi

    const logoUrl = 'https://cdn.discordapp.com/attachments/1324911668890832978/1325668769615446016/ARMA_r2.png?ex=678a7880&is=67892700&hm=3782afc00e32e3980053683968ed3eab58012034527334c317e8a0c2064e3396&';

    // Sunucuların bilgilerini embed'e ekleme
    serverDataArray.forEach((serverData, index) => {
      embed.addFields(
        { name: `TLL #${index + 1} `, value: serverData.name, inline: true },
        { name: `Oyuncular`, value: `${serverData.players}/${serverData.maxPlayers}`, inline: true },
        { name: `Durum`, value: serverData.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı', inline: true }
      );
      embed.setThumbnail(logoUrl); // Logoyu embed'e ekliyoruz
      embed.addFields({ name: '\u200B', value: '\u200B', inline: false }); // Satır arası boşluk ekliyoruz
    });

    // Embed mesajını Discord kanalına gönder
    const channel = client.channels.cache.get('1325155094118928505'); // Kanal ID'sini buraya ekleyin
    if (channel) {
        // Kanalda son gönderilen mesajı al
        const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
        
        // Eğer önceki mesaj varsa, sil
        if (lastMessage) {
          lastMessage.delete();
        }
  
        // Yeni embed mesajını gönder
        channel.send({ embeds: [embed] });
      } else {
        console.log("Kanal bulunamadı!");
      }
  } catch (error) {
    console.error('Sunucu durumu alınırken hata:', error);
  }
}

// Botu başlat
client.login(TOKEN);
