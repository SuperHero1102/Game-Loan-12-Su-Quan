/**
 * Loạn 12 Sứ Quân — Sử Thi Hào Hùng 12 Hồi Khởi Nghĩa & Thống Nhất Giang Sơn (944 - 968)
 * Khảo cứu chính xác từ Đại Việt Sử Ký Toàn Thư và Khâm Định Việt Sử Thông Giám Cương Mục
 */

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  stageNumber: number;
  title: string;
  subtitle: string;
  year: string;
  location: string;
  historicalContext: string;
  battleNarrative: string;
  strategicInsight: string;
  victoryQuote: string;
  unlockedHeroName?: string;
  icon: string;
}

export const STORY_CHRONICLES: StoryChapter[] = [
  {
    id: 'chapter_prologue',
    chapterNumber: 0,
    stageNumber: 0,
    title: 'Khởi Nguyên Cờ Lau & Thần Mộng Động Hoa Lư',
    subtitle: 'Năm Mậu Thân (948) — Động Hoa Lư, Gia Viễn, Ninh Bình',
    year: '948 - 951',
    location: 'Động Hoa Lư (Ninh Bình)',
    historicalContext:
      'Năm 944, Tiền Ngô Vương Ngô Quyền băng hà. Dương Tam Kha tiếm ngôi, triều đình hỗn loạn. Các thổ hào và tướng lĩnh các nơi đua nhau nổi dậy cát cứ chia cắt giang sơn, bách tính rơi vào cảnh máu chảy đầu rơi suốt hơn hai thập kỷ.',
    battleNarrative:
      'Tại thung lũng Hoa Lư non xanh nước biếc, Đinh Bộ Lĩnh từ thuở niên thiếu đã cùng đám trẻ chăn trâu bẻ hoa lau làm cờ, khoanh tay làm kiệu tôn ông làm tướng. Khi bị chú đuổi bắt, ông nhảy xuống sông Hoàng Long thì kỳ lạ thay, có rùa vàng và Kim Ngưu Thần Tướng nổi lên chở che vượt sông. Dân làng thấy điềm trời đều kính phục đi theo, đặt nền móng cho đội nghĩa quân Hoa Lư thiện chiến.',
    strategicInsight:
      'Địa thế Hoa Lư "núi là thành, sông là hào", hiểm trở khó công dễ thủ, tạo bàn đạp vững chắc để Vạn Thắng Vương mưu việc lớn.',
    victoryQuote:
      '« Cờ lau phất ngọn tập rèn binh mã — Sông Hoàng Long chở mệnh thiên tử định giang sơn! »',
    icon: '🚩',
  },
  {
    id: 'chapter_1',
    chapterNumber: 1,
    stageNumber: 1,
    title: 'Ải 1: Bình Kiều — Uy Phong Dẹp Tan Cát Cứ',
    subtitle: 'Ngô Xương Xí (Ngô Sứ Quân) — Triệu Sơn, Thanh Hóa',
    year: '965',
    location: 'Bình Kiều (Triệu Sơn, Thanh Hóa)',
    historicalContext:
      'Ngô Xương Xí là con thứ của Nam Sách Vương Ngô Xương Ngập, dòng dõi chính thống nhà Ngô. Khi triều đình sụp đổ, ông đem quân lui về giữ đất Bình Kiều hiểm yếu ở Ái Châu.',
    battleNarrative:
      'Vạn Thắng Vương dẫn đại quân vượt đèo Ba Dội tiến vào Bình Kiều. Ngô Xương Xí cậy thế trường thương và chiến hào kiên cố. Đinh Bộ Lĩnh áp dụng chiến thuật nghi binh nhử địch ra ngoài bãi lầy sông Lãng Giang rồi hợp vây tiêu diệt. Nhận thấy chí lớn thống nhất thiên hạ của Đinh Bộ Lĩnh, Ngô Xương Xí dâng thành quy phục.',
    strategicInsight:
      'Thu phục Ngô Sứ Quân mở toang cửa ngõ phương Nam, tạo uy danh chấn động toàn cõi Giao Châu.',
    victoryQuote:
      '« Hậu duệ nhà Ngô nghiêng mình quy thuận cờ nghĩa — Cửa ngõ Ái Châu thu về một mối! »',
    icon: '🐎',
  },
  {
    id: 'chapter_2',
    chapterNumber: 2,
    stageNumber: 2,
    title: 'Ải 2: Bố Hải Khẩu — Kết Minh Phụ Tử Nghĩa Lớn',
    subtitle: 'Trần Lãm (Trần Minh Công) — Kỳ Bố, Thái Bình',
    year: '966',
    location: 'Bố Hải Khẩu (TP. Thái Bình ngày nay)',
    historicalContext:
      'Trần Lãm là bậc lão thần đức cao vọng trọng, cát cứ vùng cửa biển Kỳ Bố Hải Khẩu phì nhiêu trù phú, quân lương dồi dào bậc nhất phương Bắc.',
    battleNarrative:
      'Đinh Bộ Lĩnh cùng con trưởng Đinh Liễn đem quân đến Bố Hải Khẩu cầu liên minh. Nhìn thấy khí phách anh hùng và phong thái đế vương của Đinh Bộ Lĩnh, Trần Lãm mừng rỡ gả con gái và nhận ông làm nghĩa tử. Khi tuổi già sức yếu, Trần Minh Công trao toàn bộ binh quyền và kho lương Kỳ Bố cho Đinh Bộ Lĩnh.',
    strategicInsight:
      'Không tốn một mũi tên mà có được toàn bộ hậu cần miền duyên hải, quân lực Hoa Lư tăng gấp bội phần.',
    victoryQuote:
      '« Nghĩa phụ trao cờ quân cửa bể — Tiền bạc lương thảo vững như bàn thạch! »',
    icon: '⚓',
  },
  {
    id: 'chapter_3',
    chapterNumber: 3,
    stageNumber: 3,
    title: 'Ải 3: Đỗ Động Giang — Đại Phá Đầm Lầy Sông Đáy',
    subtitle: 'Đỗ Cảnh Thạc (Đỗ Lãnh Công) — Quốc Oai, Hà Nội',
    year: '967',
    location: 'Đỗ Động Giang (Quốc Oai, Hà Nội)',
    historicalContext:
      'Đỗ Cảnh Thạc là danh tướng thiện chiến bậc nhất của Ngô Quyền, từng tham gia đại thắng Bạch Đằng năm 938. Ông xây thành Đỗ Động kiên cố với hơn 500 chiến thuyền tinh nhuệ.',
    battleNarrative:
      'Trận đánh kéo dài hơn một năm ròng rã bên bờ Đỗ Động Giang. Đỗ Cảnh Thạc dùng đầm lầy và thiết kỵ chống trả quyết liệt. Đinh Bộ Lĩnh cho đào kênh dẫn nước, chia cắt chiến thuyền địch, ban đêm dùng kỵ binh tập kích đồn doanh. Đỗ Cảnh Thạc trúng tên tử trận, tàn quân tan rã.',
    strategicInsight:
      'Bẻ gãy cánh quân thiện chiến nhất của cựu triều Ngô Vương, dẹp tan mối lo ở sườn Tây kinh thành.',
    victoryQuote:
      '« Đỗ Động sóng dâng vùi danh tướng — Kiếm lệnh tung bay quét sạch đầm lầy! »',
    icon: '🗡️',
  },
  {
    id: 'chapter_4',
    chapterNumber: 4,
    stageNumber: 4,
    title: 'Ải 4: Đằng Châu — Nghĩa Khí Quy Hàng Soái Tướng',
    subtitle: 'Phạm Bạch Hổ (Phạm Phòng Át) — Kim Động, Hưng Yên',
    year: '967',
    location: 'Đằng Châu (Khoái Châu, Hưng Yên)',
    historicalContext:
      'Phạm Bạch Hổ là bậc danh gia vọng tộc dòng dõi tướng soái Đằng Châu, nổi tiếng võ công quán thế và nắm giữ đội quân thiết giáp dũng cảm.',
    battleNarrative:
      'Vạn Thắng Vương gửi thư phân tích rõ đại cục non sông: cát cứ chỉ làm lầm than dân chúng và tạo cơ hội cho nhà Tống phương Bắc dòm ngó. Cảm kích tấm lòng vì nước vì dân của Đinh Bộ Lĩnh, Phạm Bạch Hổ mở toang cổng thành Đằng Châu, dẫn đầu tướng sĩ quy phục và được phong làm Thân vệ Đại tướng quân.',
    strategicInsight:
      'Tập hợp được hào kiệt châu thổ sông Hồng mà không tốn xương máu của quân sĩ hai bên.',
    victoryQuote:
      '« Phạm Phòng Át thuận thiên theo chánh nghĩa — Quân tướng Đằng Châu gia nhập cờ hoa! »',
    icon: '🐯',
  },
  {
    id: 'chapter_5',
    chapterNumber: 5,
    stageNumber: 5,
    title: 'Ải 5: Tây Phù Liệt — Hỏa Công Phá Thành Cổ Loa',
    subtitle: 'Nguyễn Siêu (Nguyễn Hữu Công) — Thanh Trì, Hà Nội',
    year: '967',
    location: 'Tây Phù Liệt (Thanh Trì, Hà Nội)',
    historicalContext:
      'Nguyễn Siêu là sứ quân kiêu dũng, đóng quân tại Tây Phù Liệt sát kinh kỳ, quân đông hàng vạn, có danh hiệu là "Bạch Mã đại tướng quân".',
    battleNarrative:
      'Trận Tây Phù Liệt diễn ra vô cùng khốc liệt. Nguyễn Siêu mưu tính tập kích vào hậu phương Hoa Lư nhưng bị quân phục kích của Nguyễn Bặc và Đinh Điền chặn đứng. Đinh Bộ Lĩnh dùng thuyền hỏa công thuận chiều gió thiêu rụi doanh trại. Nguyễn Siêu phá vây chạy về phía Bạch Hạc thì bị đắm thuyền tử nạn.',
    strategicInsight:
      'Xóa sổ thế lực quân sự mạnh nhất án ngữ con đường thủy bộ huyết mạch nối Hoa Lư ra châu thổ Bắc Bộ.',
    victoryQuote:
      '« Khói lửa Tây Phù Liệt rực trời giông bão — Dòng nước sông Hồng cuốn sạch kiêu hùng! »',
    icon: '🔥',
  },
  {
    id: 'chapter_6',
    chapterNumber: 6,
    stageNumber: 6,
    title: 'Ải 6: Tế Giang — Chiến Lũy Sông Hồng Tan Vỡ',
    subtitle: 'Lữ Đường (Lữ Tá Công) — Văn Giang, Hưng Yên',
    year: '967',
    location: 'Tế Giang (Văn Giang, Hưng Yên)',
    historicalContext:
      'Lữ Đường tự xưng Lữ Tá Công, chiếm cứ vùng Tế Giang trù phú, dựa vào các đê điều hiểm hóc bên tả ngạn sông Hồng để cố thủ.',
    battleNarrative:
      'Đinh Bộ Lĩnh xuất kỳ bất ý chia quân làm ba cánh: cánh thủy bao vây sông Tế Giang, cánh bộ thọc sâu vào căn cứ hậu phương cắt đứt đường tiếp tế. Quân Lữ Đường núng thế vỡ trận, Lữ Đường bị chém tại trận tiền.',
    strategicInsight:
      'Chiến thắng này giúp toàn bộ vùng bãi bồi sông Hồng phía Đông hoàn toàn yên bình.',
    victoryQuote:
      '« Chiến lũy Tế Giang một phen tan tác — Quân dân Văn Giang mở hội mừng reo! »',
    icon: '🛡️',
  },
  {
    id: 'chapter_7',
    chapterNumber: 7,
    stageNumber: 7,
    title: 'Ải 7: Siêu Loại — Phục Kích Rừng Già Thuận Thành',
    subtitle: 'Lý Khuê (Lý Lãng Công) — Thuận Thành, Bắc Ninh',
    year: '967',
    location: 'Siêu Loại (Thuận Thành, Bắc Ninh)',
    historicalContext:
      'Lý Khuê là thủ lĩnh đất Kinh Bắc giàu văn hiến, thành lũy Siêu Loại được xây đắp kiên cố với hào sâu rào tre dầy đặc.',
    battleNarrative:
      'Quân Hoa Lư áp dụng chiến thuật "Vây thành diệt viện". Khi Lý Khuê dẫn quân phá vây mở đường máu về phương Bắc, tướng quân Lê Hoàn đón đường phục kích tiêu diệt toàn bộ lực lượng chủ lực. Thành Siêu Loại đầu hàng.',
    strategicInsight:
      'Đặt quyền kiểm soát lên vùng đất Thuận Thành, cửa ngõ giao thương của vùng Đông Bắc.',
    victoryQuote:
      '« Rừng già Siêu Loại phục binh vây hãm — Đất cổ Kinh Bắc cúi phục cờ vương! »',
    icon: '🪓',
  },
  {
    id: 'chapter_8',
    chapterNumber: 8,
    stageNumber: 8,
    title: 'Ải 8: Đường Lâm — Tiễu Trừ Phản Trắc Xứ Đoài',
    subtitle: 'Ngô Nhật Khánh (Ngô An Vương) — Sơn Tây, Hà Nội',
    year: '967 - 968',
    location: 'Đường Lâm (Sơn Tây, Hà Nội)',
    historicalContext:
      'Ngô Nhật Khánh là cháu họ của Tiền Ngô Vương, tự xưng An Vương, cát cứ tại ấp Đường Lâm - mảnh đất "hai vua" sinh ra Phùng Hưng và Ngô Quyền.',
    battleNarrative:
      'Ngô Nhật Khánh cậy có hào khí đất tổ ra sức chống cự. Đinh Bộ Lĩnh thân chinh đem đại quân tiến đánh, kẹp chặt vòng vây tứ phía. Không chịu nổi sức ép, Nhật Khánh dâng thành xin hàng. Đinh Bộ Lĩnh vì lòng trọng thị tiền vương đã tha thứ và gả con gái cho Nhật Khánh.',
    strategicInsight:
      'Chiến thắng có ý nghĩa biểu tượng lịch sử vô cùng to lớn khi quy tụ được vùng đất địa linh nhân kiệt Đường Lâm.',
    victoryQuote:
      '« Mảnh đất hai vua cúi mình kính phục — Cờ vương rợp bóng núi Tản sông Đà! »',
    icon: '👑',
  },
  {
    id: 'chapter_9',
    chapterNumber: 9,
    stageNumber: 9,
    title: 'Ải 9: Hồi Hồ — Đập Tan Cứ Điểm Cẩm Khê',
    subtitle: 'Kiều Thuận (Kiều Lệnh Công) — Cẩm Khê, Phú Thọ',
    year: '968',
    location: 'Hồi Hồ (Cẩm Khê, Phú Thọ)',
    historicalContext:
      'Kiều Thuận là anh em với Kiều Công Hãn, dòng dõi hào tộc bản địa nhiều đời làm chúa đất miền trung du châu thổ sông Thao.',
    battleNarrative:
      'Kiều Thuận dựa vào rừng sâu núi thẳm và cung tiễn độc lập phòng thủ. Đinh Bộ Lĩnh cử tướng lĩnh am hiểu địa hình miền núi luồn sâu triệt hạ các trạm canh, ban đêm đốt lửa hun khói làm quân địch hoảng loạn bỏ chạy. Kiều Thuận thế cùng lực kiệt phải quy hàng.',
    strategicInsight:
      'Cô lập hoàn toàn đại bản doanh Phong Châu của Kiều Công Hãn ở phía Tây.',
    victoryQuote:
      '« Núi rừng Cẩm Khê bình định trong gang tấc — Sóng nước sông Thao trong vắt bóng cờ! »',
    icon: '⚔️',
  },
  {
    id: 'chapter_10',
    chapterNumber: 10,
    stageNumber: 10,
    title: 'Ải 10: Tiên Du — Bẻ Gãy Ba Lệnh Công Vũ Ninh',
    subtitle: 'Nguyễn Thủ Tiệp (Ba Lệnh Công) — Tiên Du, Bắc Ninh',
    year: '968',
    location: 'Tiên Du (Vũ Ninh, Bắc Ninh)',
    historicalContext:
      'Nguyễn Thủ Tiệp tự xưng Ba Lệnh Công, em của Nguyễn Siêu, nắm giữ vùng đất Tiên Du màu mỡ cùng đội quân chiến thuyền cơ động.',
    battleNarrative:
      'Sau cái chết của anh trai ở Tây Phù Liệt, Nguyễn Thủ Tiệp càng dốc toàn lực xây dựng chiến hào Tiên Du. Quân Hoa Lư dùng kế hỏa công công phá bến thuyền, bắt sống bộ chỉ huy. Nguyễn Thủ Tiệp tháo chạy nhưng bị quân phục kích bắt giữ.',
    strategicInsight:
      'Quét sạch tàn dư cuối cùng của thế lực anh em họ Nguyễn ở vùng Kinh Bắc.',
    victoryQuote:
      '« Ba Lệnh quy hàng dưới chân đồi Tiên Du — Bắc Ninh một dải sạch bóng đao binh! »',
    icon: '🏹',
  },
  {
    id: 'chapter_11',
    chapterNumber: 11,
    stageNumber: 11,
    title: 'Ải 11: Tam Đái — Cảm Hóa Bậc Đạo Trưởng Túc Nho',
    subtitle: 'Nguyễn Khoan (Nguyễn Thái Bình) — Yên Lạc, Vĩnh Phúc',
    year: '968',
    location: 'Tam Đái (Vĩnh Tường, Vĩnh Phúc)',
    historicalContext:
      'Nguyễn Khoan là anh cả của Nguyễn Siêu và Nguyễn Thủ Tiệp, am hiểu đạo giáo và nho học, đóng quân tại vùng Tam Đái, lấy hiệu là Nguyễn Thái Bình.',
    battleNarrative:
      'Thấy hai em đều thất trận, thế nước đã quy về Hoa Lư, Nguyễn Khoan không muốn bách tính lầm than thêm nữa. Khi Đinh Bộ Lĩnh dẫn đại quân đến ngoài lũy tre Tam Đái, Nguyễn Khoan đích thân mở cổng thành, cởi giáp bái kiến, dâng toàn bộ sổ sách dân đinh đất Tam Đái cho nghĩa quân.',
    strategicInsight:
      'Thu phục lòng dân bằng nhân đức và sự bao dung của bậc minh chủ.',
    victoryQuote:
      '« Đạo giáo Tam Đái mở lòng hòa hợp — Đức độ minh vương cảm hóa muôn phương! »',
    icon: '☯️',
  },
  {
    id: 'chapter_12',
    chapterNumber: 12,
    stageNumber: 12,
    title: 'Ải 12: Phong Châu — Trận Quyết Chiến Đỉnh Cao',
    subtitle: 'Kiều Công Hãn (Kiều Tam Chế) — Việt Trì, Phú Thọ',
    year: '968',
    location: 'Phong Châu (Bạch Hạc, Phú Thọ)',
    historicalContext:
      'Kiều Công Hãn là sứ quân kiên cường và kiêu ngạo nhất, đóng cứ tại đất tổ Phong Châu nơi hợp lưu của ba con sông lớn (sông Đà, sông Lô, sông Hồng). Thành lũy Phong Châu được coi là bất khả xâm phạm.',
    battleNarrative:
      'Vạn Thắng Vương huy động toàn lực thủy bộ quân đội Hoa Lư mở chiến dịch tổng công kích Phong Châu. Các cánh quân do Lê Hoàn, Phạm Bạch Hổ, Nguyễn Bặc đồng loạt tấn công trên cả ba mặt sông. Kiều Công Hãn liều chết phá vòng vây nhưng bị chém tại bến Bạch Hạc. Thành Phong Châu chính thức thất thủ, chấm dứt hoàn toàn 20 năm loạn thập nhị sứ quân!',
    strategicInsight:
      'Trận đánh lịch sử quét sạch cát cứ phong kiến cuối cùng, đặt dấu chấm son cho sự nghiệp thống nhất quốc gia.',
    victoryQuote:
      '« Hợp lưu ba sông ngút trời oai linh — Thập nhị sứ quân chính thức dẹp yên! »',
    icon: '🏆',
  },
  {
    id: 'chapter_epilogue',
    chapterNumber: 13,
    stageNumber: 13,
    title: 'Đại Lễ Đăng Quang: Khai Sinh Quốc Hiệu ĐẠI CỒ VIỆT',
    subtitle: 'Năm Mậu Thìn (968) — Kinh Đô Hoa Lư',
    year: '968',
    location: 'Kinh Đô Hoa Lư (Ninh Bình)',
    historicalContext:
      'Sau hơn một ngàn năm Bắc thuộc và 20 năm nội loạn chia cắt, non sông bờ cõi lần đầu tiên quy về một mối hoàn chỉnh dưới sự lãnh đạo tài tình của Vạn Thắng Vương.',
    battleNarrative:
      'Mùa xuân năm Mậu Thìn 968, tại Động Hoa Lư kỳ vĩ, Vạn Thắng Vương Đinh Bộ Lĩnh chính thức lên ngôi HOÀNG ĐẾ, lấy đế hiệu là ĐINH TIÊN HOÀNG. Ngài đặt quốc hiệu là ĐẠI CỒ VIỆT (Nước Việt Lớn), định đô tại Hoa Lư, đúc tiền đồng "Thái Bình Hưng Bảo" — đồng tiền đầu tiên trong lịch sử nước nhà, chế định triều nghi, phong quan chức, mở ra trang sử thái bình thịnh trị rực rỡ.',
    strategicInsight:
      'Khẳng định nền độc lập tự chủ sánh ngang với các hoàng đế phương Bắc, lưu danh muôn thuở trong sử sách dân tộc.',
    victoryQuote:
      '« Bẻ cờ lau dựng nên cơ nghiệp lớn — Xưng Hoàng Đế thái bình cõi trời Nam! »',
    icon: '🐉',
  },
];
